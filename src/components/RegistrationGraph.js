import React from 'react';
import LineGraph from 'react-line-graph';
import moment from 'moment';
import { Heading } from '@codeday/topo/Atom/Text';
import InfoBox from './InfoBox';
import Text from '@codeday/topo/Atom/Text';

export default function RegistrationGraph({ event, children, ...props }) {
    const now = moment();
    const graphStart = now.clone().subtract(60, 'days');
    const data = [{ x: 0, y: 0 }];
    event.tickets.sort((a, b) => moment(a.createdAt) >= moment(b.createdAt)).forEach((ticket) => {
        const createdAt = moment(ticket.createdAt);
        if (createdAt <= graphStart) {
            data[0].y += 1;
        } else {
            data.push({ x: moment.duration(createdAt.diff(graphStart)).as('days'), y: data[data.length - 1].y + 1 });
        }
    });
    data.push({ x: 60, y: data[data.length - 1].y });
    return (
        <InfoBox heading="Registrations" headingSize="xl" {...props}>
            <Heading>{event.tickets.length} Registrations</Heading>
            <Text m={0} ml={.5} size="sm">{event.soldTickets} students; {event.tickets.length - event.soldTickets} staff</Text>
            {children}
            {event.soldTickets > 0 && <LineGraph data={data} />}
        </InfoBox>
    );
}
