const fastify =	require('fastify')()
const Ajv = require('ajv')
const ajv = new Ajv({removeAdditional: true})
const knex = require('knex')({
	client: 'sqlite3',
	connection: {
		filename: './db.sqlite'
	},
	useNullAsDefault: true
})

// Compile the contact schema
ajv.addSchema(require('./schemas/contact.json'), 'contact')


// knex: if contacts table does not exist, create it
knex.schema.hasTable('contacts').then(function(exists) {
	if (!exists) {
		return knex.schema.createTable('contacts', function(t) {
			t.increments('id').primary();
			t.json('obj');
		});
	}
});


// start fastify on port 3030
fastify.listen(3030, function (err, address) {
	if (err) {
		fastify.log.error(err)
		process.exit(1)
	}
	fastify.log.info(`server listening on ${address}`)
})
