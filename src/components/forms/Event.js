import React, {useState} from 'react';
import Form from '@rjsf/antd';

import Box from '@codeday/topo/Atom/Box';
import Button from '@codeday/topo/Atom/Button';
import Text, {Heading} from '@codeday/topo/Atom/Text';
import {Modal} from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import * as Icon from '@codeday/topocons/Icon';
import {print} from 'graphql';
import {useToasts} from '@codeday/topo/utils';
import {useRouter} from 'next/router';
import moment from 'moment-timezone';
import {getSession} from 'next-auth/client';
import {CreateEventMutation, DeleteEventMutation, UpdateEventMutation} from './Event.gql';
import {useFetcher} from '../../fetch';
import {InfoAlert} from '../Alert';

const schema = {
    type: 'object',
    properties: {
        name: {
            title: 'Name',
            type: 'string',
        },
        startDate: {
            title: 'Start Date',
            type: 'string',
            format: 'date',
        },
        endDate: {
            title: 'End Date',
            type: 'string',
            format: 'date',
        },
        ticketPrice: {
            title: 'Ticket Price',
            type: 'number',
            multipleOf: 0.01,
        },
        earlyBirdPrice: {
            title: 'Early Bird Ticket Price',
            type: 'number',
            multipleOf: 0.01,
        },
        earlyBirdCutoff: {
            title: 'Early Bird Registration Cutoff',
            description: 'Usually set to a month before the event',
            type: 'string',
            format: 'date',
        },
        registrationCutoff: {
            title: 'Registration Cutoff',
            type: 'string',
            format: 'date',
        },
        contentfulWebname: {
          title: 'Contentful region ID',
          type: 'string'
        },
        managers: {
            title: 'Regional Managers (CodeDay Account usernames)',
            type: 'array',
            uniqueItems: true,
            items: {
                type: 'string',
            },
        },
        showcaseId: {
            title: 'Showcase ID',
            type: 'string'
        }
    },
};

const uiSchema = {
    managers: {
        'ui:options': {
            orderable: false,
        },
    },
};

export function CreateEventModal({group, children, ...props}) {
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        startDate: moment(group.startDate).utc().format('LL'),
        endDate: moment(group.endDate).utc().format('LL'),
        ticketPrice: group.ticketPrice,
        earlyBirdPrice: group.earlyBirdPrice,
        earlyBirdCutoff: moment(group.earlyBirdCutoff).utc().format('LL'),
        registrationCutoff: moment(group.registrationCutoff).utc().format('LL'),
    });
    let fetch;
    getSession().then((onResolved) => fetch = useFetcher(onResolved));
    const [loading, setLoading] = useState(false);
    const {success, error} = useToasts();
    const onOpenModal = () => setOpen(true);
    const onCloseModal = () => setOpen(false);
    const router = useRouter();

    return (
        <Box {...props}>
            <Button onClick={onOpenModal}>{children || <><Icon.UiAdd/>Add Event</>}</Button>
            <Modal open={open} onClose={onCloseModal} center>
                <Heading>Create Event</Heading>
                <InfoAlert>Default values have been autofilled from the Event Group</InfoAlert>
                <Form
                    uiSchema={uiSchema}
                    schema={schema}
                    formData={formData}
                    onChange={(data) => setFormData(data.formData)}
                >
                    <Button
                        isLoading={loading}
                        disabled={loading}
                        onClick={async () => {
                            setLoading(true);
                            try {
                                await fetch(print(CreateEventMutation), {
                                    data: {
                                        ...formData,
                                        managers: {
                                            set: formData.managers || []
                                        },
                                        eventGroup: {
                                            connect: {id: group.id},
                                        },
                                    },
                                });
                                await router.replace(router.asPath);
                                success('Event Created');
                                onCloseModal();
                            } catch (ex) {
                                error(ex.toString());
                            }
                            setLoading(false);
                        }}
                    >Submit
                    </Button>
                </Form>
            </Modal>
        </Box>
    );
}

export function UpdateEventModal({event, children, ...props}) {
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        ...event,
        startDate: moment(event.startDate).utc().format('LL'),
        endDate: moment(event.endDate).utc().format('LL'),
        earlyBirdCutoff: moment(event.earlyBirdCutoff).utc().format('LL'),
        registrationCutoff: moment(event.registrationCutoff).utc().format('LL')
    });
    let fetch;
    getSession().then((onResolved) => fetch = useFetcher(onResolved));
    const [loading, setLoading] = useState(false);
    const {success, error} = useToasts();
    const onOpenModal = () => setOpen(true);
    const onCloseModal = () => setOpen(false);
    const router = useRouter();
    console.log(formData);

    function formDataToUpdateInput(formData) {
        const ret = {};
        Object.keys(schema.properties).map((key) => {
            if (formData[key] !== event[key]) ret[key] = {set: formData[key]};
        });
        return ret;
    }

    return (
        <Box d="inline" {...props}>
            <Button d="inline" onClick={onOpenModal}>{children || <Icon.UiEdit/>}</Button>
            <Modal open={open} onClose={onCloseModal} center>
                <Form
                    uiSchema={uiSchema}
                    schema={schema}
                    formData={formData}
                    onChange={(data) => setFormData(data.formData)}
                >
                    <Button
                        isLoading={loading}
                        disabled={loading}
                        onClick={async () => {
                            setLoading(true);
                            try {
                                console.log('fetch');
                                await fetch(print(UpdateEventMutation), {
                                    where: {id: event.id},
                                    data: formDataToUpdateInput(formData)
                                });
                                console.log('replace');
                                await router.replace(router.asPath);
                                success('Event Updated');
                                onCloseModal();
                            } catch (ex) {
                                error(ex.toString());
                            }
                            setLoading(false);
                        }}
                    >Submit
                    </Button>
                </Form>
            </Modal>
        </Box>
    );
}

export function DeleteEventModal({event, children, ...props}) {
    const [open, setOpen] = useState(false);
    let fetch;
    getSession().then((onResolved) => fetch = useFetcher(onResolved));
    const [loading, setLoading] = useState(false);
    const {success, error} = useToasts();
    const onOpenModal = () => setOpen(true);
    const onCloseModal = () => setOpen(false);
    const router = useRouter();

    return (
        <Box d="inline">
            <Button d="inline" onClick={onOpenModal}>{children || <Icon.UiTrash/>}</Button>
            <Modal open={open} onClose={onCloseModal} center>
                <Heading>Remove Event</Heading>
                <Text>Are you sure you want to delete this event?
                    <br/>
                    There's no turning back!
                </Text>
                <Button
                    colorScheme="red"
                    disabled={loading}
                    isLoading={loading}
                    onClick={async () => {
                        setLoading(true);
                        try {
                            await fetch(print(DeleteEventMutation), {where: {id: event.id}});
                            await router.replace(router.asPath);
                            success('Event Deleted');
                            onCloseModal();
                        } catch (ex) {
                            error(ex.toString());
                        }
                        setLoading(false);
                    }}
                ><Icon.UiTrash/><b>Delete Event</b>
                </Button>
                <Button onClick={onCloseModal}><Icon.UiX/>Cancel</Button>
            </Modal>
        </Box>
    );
}
