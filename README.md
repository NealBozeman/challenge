JSON Code Challenge
------
A playground demo is available at:
[https://3030.nealbozeman.com/api/v1/call-list](https://3030.nealbozeman.com/api/v1/call-list)

List of issues & considerations:
[Git Issues](https://github.com/NealBozeman/challenge/issues)

[Repo](https://github.com/NealBozeman/challenge)

### Objective

Write an api in NodeJS that allows a client to POST, PUT, GET, and DELETE "contacts" in a database. Original specs here: [NodeJS Challenge Spec](./challenge.docx)

### Setup

``` 
npm i
./run-dev.sh
```

By default, the app will run on port 3030.

## Tests

If running in dev environment, we will run a set of integrated tests at startup to check the responses of each of our endpoints.

### My Considerations

*Patterns*

- Uses a generic route that can parse a request and generically perform the HTTP verbs on any object type. This will be easy to implement and the features will work automatically with new object types in the future.

- Generic object types that can be extended are used to manipulate DB records.

- Uses AJV to validate the JSON objects before storing or serving the objects.

- Allow overrides for specific custom routes, e.g. /api/getContactList

*Security*

- Uses an API request white list to avoid data being stolen from database tables that aren't meant to be exposed.

- Using numeric ID can reveal information about a service, such as how popular it is, or allow attackers to guess record numbers. Also, incremental numeric IDs prevent efficient multi-write sharding, and mult-region backends, as all nodes have to first agree on the record number. 

* I suggest using a UUIDv4 instead of numeric. This allows us to specify the id as a string, and does not reveal any practical information to an attacker.

- We will not be determining is a token or user is authenticated, but can do so in the future on each request using middleware. 

*Libraries*

- Fastify (instead of Express): I like the ability to use request lifecycle hooks, as Express middleware only runs in the order it's loaded. Fastify hooks have the same request context as in Express middleware, but are more flexible in this regard. Also, async routes built in.

- AJV: Validator for JSON objects, prevents inserting malicious data, and prevents sending sensitive data back to the client.

- Knex: Easy to use sqlite3, and I like it.

