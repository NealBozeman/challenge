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

