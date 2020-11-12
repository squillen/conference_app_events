# conference_app_events

Events
Depends on: Locations
This must provide HTTP RESTful APIs to achieve the following:
Create and update an event (no deletion)
Manage the list of sponsorship levels for an event
Get a list of the ten closest upcoming events
Calculate the anticipated revenue for an event
This must publish event creation and modification messages so that other microservices can consume them. Use channel names "event.create" and "event.modify".
The Events Bounded Context must manage the definition of the event which includes where it's being held, the cost to attend the event, the total number of attendees, presentations and their length, types of sponsors, and vendors that it can have.

The event should be able to manage a variable number of sponsor types. For example, one event may have Gold sponsors and Silver sponsors. Another event may have Diamond, Platinum, Gold, and Silver sponsors. Each sponsorship level defined for an event should have a cost and the number of free badges each level of sponsorship gets.

The number of presentations for the event is the maximum number of presentations that the event will host. This should also include the length of time for how long a presentation should be (like 45 minutes).

The number of vendors is the maximum number of vendors that the event will host. With respect to vendors, the event should also record the cost of a booth. Each booth comes with two free badges. The maximum number of vendors cannot exceed the total number of booth spaces available at a location.

The number of attendees is the number of people that will attend that are not speakers, sponsors, or vendors. There is an associated badge cost.

Based on the cost of the attendee badges, the maximum number of attendees, the number of and types of sponsorships, and the number of vendor booths and their costs, the software should be able to calculate a maximum revenue for the event.