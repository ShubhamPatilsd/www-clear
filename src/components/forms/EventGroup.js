import React, {useState} from 'react';
import Form from "@rjsf/antd";
import Box from "@codeday/topo/Atom/Box"
import Button from "@codeday/topo/Atom/Button"
import Text, {Heading} from "@codeday/topo/Atom/Text"
import {Modal} from "react-responsive-modal";
import 'react-responsive-modal/styles.css';
import * as Icon from "@codeday/topocons/Icon";
import {InfoAlert} from "../Alert";
import {useFetcher} from "../../fetch";
import {CreateEventGroupMutation, UpdateEventGroupMutation, DeleteEventGroupMutation} from "./EventGroup.gql";
import {print} from "graphql";
import {useToasts} from "@codeday/topo/utils";
import {useRouter} from "next/router";
import moment from "moment-timezone";
import {getSession} from "next-auth/client";

const schema = {
    type: "object",
    properties: {
        name: {
            type: "string",
            name: "Name"
        },
        startDate: {
            type: 'string',
            format: 'date',
            title: 'Start',
        },
        endDate: {
            type: 'string',
            format: 'date',
            title: 'End',
        },
        ticketPrice: {
            type: "number",
            multipleOf: 0.01,
            title: "Ticket Price"
        },
        earlyBirdPrice: {
            type: "number",
            multipleOf: 0.01,
            title: "Early Bird Price"
        },
        earlyBirdCutoff: {
            type: 'string',
            format: 'date',
            title: 'Early Bird Cutoff'
        },
        registrationCutoff: {
            type: 'string',
            format: 'date',
            title: 'Registration Cutoff'
        }
    },
    required: ['name', 'startDate', 'endDate', 'ticketPrice', 'earlyBirdPrice', 'earlyBirdCutoff', 'registrationCutoff']
}

const uiSchema = {
    /* optional ui schema */
}

export function CreateEventGroupModal({children, ...props}) {
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        ticketPrice: 20.00,
        earlyBirdPrice: 15.00,
    });
    let fetch;
    getSession().then((onResolved) => fetch = useFetcher(onResolved));
    const [loading, setLoading] = useState(false)
    const {success, error} = useToasts();
    const onOpenModal = () => setOpen(true);
    const onCloseModal = () => setOpen(false);
    const router = useRouter();

    return (
        <Box {...props}>
            <Button onClick={onOpenModal}>{children ? children : <><Icon.UiAdd/>Add EventGroup</>}</Button>
            <Modal open={open} onClose={onCloseModal} center>
                <Heading>Create EventGroup</Heading>
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
                                await fetch(print(CreateEventGroupMutation), {
                                    data: {
                                        ...formData,
                                    }
                                    /* need to connect the new object
                                    to a parent object? do so here */
                                });
                                await router.replace(router.asPath)
                                success('EventGroup Created')
                                onCloseModal()
                            } catch (ex) {
                                error(ex.toString())
                            }
                            setLoading(false)
                        }}>Submit</Button>
                </Form>
            </Modal>
        </Box>
    )
}

export function UpdateEventGroupModal({eventgroup, children, ...props}) {
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        ...eventgroup,
        startDate: moment(eventgroup.startDate).utc().format('LL'),
        endDate: moment(eventgroup.endDate).utc().format('LL'),
    });
    let fetch;
    getSession().then((onResolved) => fetch = useFetcher(onResolved));
    const [loading, setLoading] = useState(false)
    const {success, error} = useToasts();
    const onOpenModal = () => setOpen(true);
    const onCloseModal = () => setOpen(false);
    const router = useRouter();

    function formDataToUpdateInput(formData) {
        const ret = {}
        Object.keys(schema.properties).map((key) => {
            if (formData[key] !== eventgroup[key]) ret[key] = {set: formData[key]}
        })
        return ret
    }

    return (
        <Box d="inline" {...props}>
            <Button d="inline" onClick={onOpenModal}>{children ? children : <Icon.UiEdit/>}</Button>
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
                                await fetch(print(UpdateEventGroupMutation), {
                                    where: {id: eventgroup.id},
                                    data: formDataToUpdateInput(formData)
                                })
                                await router.replace(router.asPath)
                                success('EventGroup Updated')
                                onCloseModal()
                            } catch (ex) {
                                error(ex.toString())
                            }
                            setLoading(false)
                        }}>Submit</Button>
                </Form>
            </Modal>
        </Box>
    )
}

export function DeleteEventGroupModal({eventgroup, children, ...props}) {
    const [open, setOpen] = useState(false);
    let fetch;
    getSession().then((onResolved) => fetch = useFetcher(onResolved));
    const [loading, setLoading] = useState(false)
    const {success, error} = useToasts();
    const onOpenModal = () => setOpen(true);
    const onCloseModal = () => setOpen(false);
    const router = useRouter();

    return (
        <Box d="inline" {...props}>
            <Button d="inline" onClick={onOpenModal}>{children ? children : <Icon.UiTrash/>}</Button>
            <Modal open={open} onClose={onCloseModal} center>
                <Heading>Remove EventGroup</Heading>
                <Text>Are you sure you want to delete this EventGroup?
                    <br/>
                    There's no turning back!</Text>
                <Button
                    colorScheme="red"
                    disabled={loading}
                    isLoading={loading}
                    onClick={async () => {
                        setLoading(true);
                        try {
                            await fetch(print(DeleteEventGroupMutation), {where: {id: eventgroup.id}})
                            await router.replace(router.asPath)
                            success('EventGroup Deleted')
                            onCloseModal()
                        } catch (ex) {
                            error(ex.toString())
                        }
                        setLoading(false);
                    }}
                ><Icon.UiTrash/><b>Delete EventGroup</b></Button>
                <Button onClick={onCloseModal}><Icon.UiX/>Cancel</Button>
            </Modal>
        </Box>
    )
}