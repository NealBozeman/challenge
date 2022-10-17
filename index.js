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


// knex: if contacts table does not exist, create it
knex.schema.hasTable('contacts').then(function(exists) {
	if (!exists) {
		return knex.schema.createTable('contacts', function(t) {
			t.increments('id').primary();
			t.json('obj');
		});
	}
});

