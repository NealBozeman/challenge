JSON Code Challenge
------

### Objective

Write an api in NodeJS that allows a client to POST, PUT, GET, and DELETE "contacts" in a database.

### My Considerations

*Patterns*

- Use a generic route that can parse a request and generically perform the HTTP verbs on any object type. This will be easy to implement and the features will work automatically with new object types in the future.

- Generic object types that can be extended.

- Use AJV to validate the JSON objects before storing or serving the objects.

- Allow overrides for specific custom routes, e.g. /api/getContactList

*Security*

- Although it won't be considered in this implementation, our API is vulnerable as the database grows. Because of our implementation design, an attacker could steal data from the API by guessing tables and IDs in a database.

- Using numeric ID can reveal information about a service, such as how popular it is, or allow attackers to guess record numbers. Also, incremental numeric IDs prevent efficient multi-write sharding, and mult-region backends, as all nodes have to first agree on the record number. 

* I suggest using a UUIDv4 instead of numeric. This allows us to specify the id as a string, and does not reveal any practical information to an attacker.

- We will not be determining is a token or user is authenticated, but can do so in the future on each request using middleware. 

*Libraries*

- Fastify (instead of Express): I like the ability to use request lifecycle hooks, as Express middleware only runs in the order it's loaded. Fastify hooks have the same request context as in Express middleware, but are more flexible in this regard. Also, async routes built in.

- AJV: Validator for JSON objects, prevents inserting malicious data, and prevents sending sensitive data back to the client.

- Knex: Easy to use sqlite3, and I like it.

### Setup

``` 
npm i
./run-dev.sh
```

By default, the app will run on port 3030.

## Tests

If running in dev environment, we will run a set of integrated tests to check the responses of each of our endpoints.