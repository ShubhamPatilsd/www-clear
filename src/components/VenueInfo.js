import React from 'react';
import Text, {Heading, Link} from '@codeday/topo/Atom/Text';
import {Flex} from '@codeday/topo/Atom/Box';
import InfoBox from './InfoBox';
import Notes from './forms/Notes';
import {SetVenueNotesMutation} from './forms/Notes.gql';
import {DeleteVenueModal, UpdateVenueModal} from './forms/Venue';
import ContactBox from './ContactBox';

export default function VenueInfo({venue, children, buttons, ...props}) {
    if (!venue) return (<InfoBox heading="Venue" buttons={buttons} {...props}>{children}</InfoBox>);
    return (
        <InfoBox
            id={venue.id}
            headingSize="xl"
            heading="Venue"
            buttons={
                <>
                    <UpdateVenueModal
                        venue={venue}
                    />
                    &nbsp;
                    <DeleteVenueModal
                        venue={venue}
                    />
                    {buttons && <>&nbsp;{buttons}</>}
                </>
            }
            {...props}
        >
            <Heading size="md">{venue.name}</Heading>
            <Text mb={0}>
                <Link href={venue.mapLink}>{venue.address}</Link>
            </Text>
            <Text mb={0}>Capacity: {venue.capacity}</Text>
            <ContactBox nested name={venue.contactName} email={venue.contactEmail} phone={venue.contactPhone}/>
            {children}
        </InfoBox>
    );
}
