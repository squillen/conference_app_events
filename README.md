# conference_app_events


# TO USE
1. ```npm install```
2. Create a ```.env``` file in the root of your project with the following contents:
```
  DB_URI=mongodb+srv://admin:hr-microservices-events@events-microservice.tb5qj.mongodb.net/test?retryWrites=true&w=majority
  DB_NAME=development
  PORT=8080
```

3. ```npm run dev```


# CRUD

## CREATE
1. **To *create* an event**, *POST* request to */event/create*. Example body:

    ```
        {
            "name": "Super Awesome Event",
            "eventDate": "12/15/2022",
            "sponsors": [
                {
                    "name": "Platinum",
                    "cost": 14500,
                    "freeBadges": 10
                },
                {
                    "name": "Gold",
                    "cost": 9000,
                    "freeBadges": 7
                },
                {
                    "name": "Bronze",
                    "cost": 4500,
                    "freeBadges": 5
                }
            ],
            "locationID": "50e4d444-0039-4446-aa38-a7dab34d7ca2",
            "attendanceCost": 300,
            "vendors": {
                "availableBooths": 16,
                "boothCost": 2000
            }
        }
    ```

## UPDATE SPONSORS
2. **To *update* an event's sponsors**, *PATCH* request to */event/updateSponsors*. Example body:

```
    {
        "name": "Super Awesome Event",
        "sponsors": [
            {
                "name": "Platinum",
                "cost": 15000,
                "freeBadges": 15
            },
            {
                "name": "Gold",
                "cost": 10,
                "freeBadges": 15
            },
            {
                "name": "Bronze",
                "cost": 4500,
                "freeBadges": 5
            }
        ]
    }
```

## GET EXPECTED EVENT REVENUE
3. **To get expected revenue for a particular event**, *GET* request to */event/expectedRevenue/:id*, where :id is the event's unique id

## GET 10 SOONEST EVENTS
4. **To see 10 soonest events**, *GET* request to */event/findNearest*


# PROMPT
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