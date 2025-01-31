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
import {getSession} from 'next-auth/client';
import {CreateGuardianMutation, DeleteGuardianMutation, UpdateGuardianMutation} from './Guardian.gql';
import {useFetcher} from '../../fetch';

export const schema = {
    type: 'object',
    properties: {
        firstName: {
            type: 'string',
            title: 'First Name',
        },
        lastName: {
            type: 'string',
            title: 'Last Name',
        },
        email: {
            type: 'string',
            title: 'Email',
        },
        phone: {
            type: 'string',
            title: 'Phone',
        },
    },
};

const uiSchema = {
    /* optional ui schema */
};

export function CreateGuardianModal({ticket, children, ...props}) {
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState(/* if you need to set default values, do so here */);
    let fetch;
    getSession().then((onResolved) => fetch = useFetcher(onResolved));
    const [loading, setLoading] = useState(false);
    const {success, error} = useToasts();
    const onOpenModal = () => setOpen(true);
    const onCloseModal = () => setOpen(false);
    const router = useRouter();

    return (
        <Box {...props}>
            <Button onClick={onOpenModal}>{children || <><Icon.UiAdd/>Add Guardian</>}</Button>
            <Modal open={open} onClose={onCloseModal} center>
                <Heading>Create Guardian</Heading>
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
                                await fetch(print(CreateGuardianMutation), {
                                    data: {
                                        ... formData

                                    },
                                    ticketId: ticket.id,
                                });
                                await router.replace(router.asPath);
                                success('Guardian Created');
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

export function UpdateGuardianModal({guardian, children, ...props}) {
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState(guardian);
    let fetch;
    getSession().then((onResolved) => fetch = useFetcher(onResolved));
    const [loading, setLoading] = useState(false);
    const {success, error} = useToasts();
    const onOpenModal = () => setOpen(true);
    const onCloseModal = () => setOpen(false);
    const router = useRouter();

    function formDataToUpdateInput(formData) {
        const ret = {};
        Object.keys(schema.properties).map((key) => {
            if (formData[key] !== guardian[key]) ret[key] = {set: formData[key]};
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
                                await fetch(print(UpdateGuardianMutation), {
                                    where: {id: guardian.id},
                                    data: formDataToUpdateInput(formData),
                                });
                                await router.replace(router.asPath);
                                success('Guardian Updated');
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

export function DeleteGuardianModal({guardian, children, ...props}) {
    const [open, setOpen] = useState(false);
    let fetch;
    getSession().then((onResolved) => fetch = useFetcher(onResolved));
    const [loading, setLoading] = useState(false);
    const {success, error} = useToasts();
    const onOpenModal = () => setOpen(true);
    const onCloseModal = () => setOpen(false);
    const router = useRouter();

    return (
        <Box d="inline" {...props}>
            <Button d="inline" onClick={onOpenModal}>{children || <Icon.UiTrash/>}</Button>
            <Modal open={open} onClose={onCloseModal} center>
                <Heading>Remove Guardian</Heading>
                <Text>Are you sure you want to delete this Guardian?
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
                            await fetch(print(DeleteGuardianMutation), {where: {id: guardian.id}});
                            await router.replace(router.asPath);
                            success('Guardian Deleted');
                            onCloseModal();
                        } catch (ex) {
                            error(ex.toString());
                        }
                        setLoading(false);
                    }}
                ><Icon.UiTrash/><b>Delete Guardian</b>
                </Button>
                <Button onClick={onCloseModal}><Icon.UiX/>Cancel</Button>
            </Modal>
        </Box>
    );
}
