import React from 'react';
import {getEventGroup} from './index.gql'
import {Heading} from '@codeday/topo/Atom/Text'
import Box, {Grid} from '@codeday/topo/Atom/Box';
import Button from '@codeday/topo/Atom/Button'
import {useFetcher} from "../../../fetch";
import {useRouter} from "next/router";
import Page from "../../../components/Page";
import Event from "../../../components/Event";
import {print} from 'graphql';
import Breadcrumbs from "../../../components/Breadcrumbs";
import {getSession} from "next-auth/client";
import {CreateEventModal} from "../../../components/forms/Event";
import {DeleteEventGroupModal, UpdateEventGroupModal} from "../../../components/forms/EventGroup";

export default function Group({group}) {
    if (!group) return <Page/>
    const {query} = useRouter();
    return (
        <Page title={group.name}>
            <Breadcrumbs group={group}/>
            <Heading>{group.name} <UpdateEventGroupModal eventgroup={group}/> <DeleteEventGroupModal eventgroup={group} /></Heading>
            <Box display="inline-flex">
                <Heading m={4} size="md" display="inline-flex"><b>Events</b></Heading>
                <CreateEventModal group={group}/>
            </Box>
            <Grid templateColumns={{base: '1fr', md: "repeat(4, 1fr)"}} gap={4} m={4}>
                {group.events?.map((event) => {
                    return <Event event={event} key={event.id}/>
                })}
            </Grid>
            {/*<Heading m={4} size="md" display="inline-flex"><b>Schedule</b></Heading>*/}
            {/*<Button display="inline-flex"*/}
            {/*        size="sm"*/}
            {/*        alignSelf="center"*/}
            {/*        as="a"*/}
            {/*        href={`${query.group}/schedule/createScheduleItem`}>Create Schedule Item</Button>*/}
            {/*<Calendar schedule={group.schedule} />*/}
        </Page>
    )
}

export async function getServerSideProps({req, res, params: {group: groupId}}) {
    const session = await getSession({req})
    const fetch = useFetcher(session);
    if (!session) return {props: {}}
    const groupResp = await fetch(print(getEventGroup), {'data': {'id': groupId}})
    return {
        props: {
            group: groupResp.clear.eventGroup
        }
    }
}
