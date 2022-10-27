const fastify = require('fastify')()
const Ajv = require('ajv')
const ajv = new Ajv({ removeAdditional: "all" })
const merge = require('lodash.merge')
const FastifyPrettier = require('fastify-prettier')
const knex = require('knex')({
	client: 'sqlite3',
	connection: {
		filename: './db.sqlite'
	},
	useNullAsDefault: true
})
const ApiWhitelist = [
	"contacts",
	"call-list",
	"load-test-contacts-in-bulk",
	"setup"
]

// Compile the contact schema
var Validators = {}
Validators.contacts = ajv.compile(require('./schemas/contact.json'))

const testContact = { "name": { "first": "Harold", "middle": "Francis", "last": "Gilkey" }, "address": { "street": "8360 High Autumn Row", "city": "Cannon", "state": "Delaware", "zip": "19797" }, "phone": [{ "number": "302-611-9148", "type": "home" }, { "number": "302-532-9427", "type": "mobile" }], "email": "harold.gilkey@yahoo.com" }
const bulkContacts = [
	{ "name": { "first": "Alfred", "middle": "G", "last": "Likely" }, "address": { "street": "8360 High Autumn Row", "city": "Cannon", "state": "Delaware", "zip": "19797" }, "phone": [{ "number": "302-611-9148", "type": "home" }, { "number": "302-132-9427", "type": "mobile" }], "email": "	" },
	{ "name": { "first": "Samantha", "middle": "", "last": "Harris" }, "address": { "street": "8360 High Autumn Row", "city": "Cannon", "state": "Delaware", "zip": "19797" }, "phone": [{ "number": "302-611-9148", "type": "home" }, { "number": "302-532-3123", "type": "mobile" }], "email": " " },
	{ "name": { "first": "Zachary", "middle": "Francis", "last": "Plainlittle" }, "address": { "street": "8360 High Autumn Row", "city": "Cannon", "state": "Delaware", "zip": "19797" }, "phone": [{ "number": "302-611-2342", "type": "home" }, { "number": "302-123-9427", "type": "mobile" }], "email": " " },
	{ "name": { "first": "Isa", "middle": " ", "last": "Gutierrez" }, "address": { "street": "8360 High Autumn Row", "city": "Cannon", "state": "Delaware", "zip": "19797" }, "phone": [{ "number": "302-234-9148", "type": "home" }, { "number": "302-231-9427", "type": "mobile" }], "email": " " },
	{ "name": { "first": "Vlad", "middle": "", "last": "Rostovsky" }, "address": { "street": "123 High Autumn Row", "city": "Cannon", "state": "Delaware", "zip": "19797" }, "phone": [{ "number": "321-611-9148", "type": "home" }, { "number": "302-532-3123", "type": "mobile" }], "email": " " },
	{ "name": { "first": "Anilio", "middle": "", "last": "Rostovsky" }, "address": { "street": "123 High Autumn Row", "city": "Cannon", "state": "Delaware", "zip": "19797" }, "phone": [{ "number": "321-611-9148", "type": "home" }, { "number": "302-532-3123", "type": "mobile" }], "email": " " },
	{ "name": { "first": "Roxana", "middle": "", "last": "Rostovsky" }, "address": { "street": "123 High Autumn Row", "city": "Cannon", "state": "Delaware", "zip": "19797" }, "phone": [{ "number": "321-611-9148", "type": "home" }, { "number": "302-532-3123", "type": "mobile" }], "email": " " },
	{ "name": { "first": "Olga", "middle": "", "last": "Rostovsky" }, "address": { "street": "123 High Autumn Row", "city": "Cannon", "state": "Delaware", "zip": "19797" }, "phone": [{ "number": "321-611-9148", "type": "home" }, { "number": "302-532-3123", "type": "mobile" }], "email": " " },
]


// start fastify on port 3030
fastify.register(FastifyPrettier, { alwaysOn: true })
fastify.listen({ port: 3030, host: '0.0.0.0' }, function (err, address) {
	if (err) {
		console.log(err)
		process.exit(1)
	}
	fastify.log.info(`server listening on ${address}`)
})



// add a generic fastify route for /api/v1/{type}/{id} with id optional
fastify.route({
	path: '/api/v1/:type/:id?',
	method: ['POST', 'GET', 'PUT', 'DELETE'],
	handler: async (req, res) => {
		try {
			// if "type" is not in ApiWhitelist, then return 404
			if (!ApiWhitelist.includes(req.params.type)) { return res.code(404).send() }

			let record

			// check to see if a special handler exists for this request
			let overrideFunc = `api-${req.method.toLowerCase()}-${req.params.type}`
			if (typeof overrides[overrideFunc] === 'function') {
				await overrides[overrideFunc](req, res)
				return
			} else {

				//	no special handler, so use the generic handler
				switch (req.method) {

					case 'POST':	// create a new record of type {type}
						record = new GenericRecord(req.params.type)
						record.set(req.body)
						await record.save()
						await res.send(record.validate())
						break

					case 'GET':
						// get a record of type {type} with id {id}
						if (!req.params.id) {
							// Send a 404 with a message that the id is missing
							res.code(404).send({ error: 'id is missing' })
						} else {
							record = new GenericRecord(req.params.type)
							await record.load(req.params.id)
							res.send(record.validate())
						}
						break

					case 'PUT':
						// update a record of type {type} with id {id}
						if (!req.params.id) {
							// Send a 404 with a message that the id is missing
							res.code(404).send({ error: 'id is missing' })
						} else {
							record = new GenericRecord(req.params.type)
							await record.load(req.params.id)
							record.set(req.body)
							await record.save()
							res.send(record.validate())
						}
						break

					case 'DELETE':
						// delete a record of type {type} with id {id}
						if (!req.params.id) {
							// Send a 404 with a message that the id is missing
							res.code(404).send({ error: 'id is missing' })
						} else {
							record = new GenericRecord(req.params.type)
							await record.load(req.params.id)
							let status = await record.delete()
							res.send({ status })
						}
				}
			}
		} catch (error) {
			// on any error, send to client
			res.code(500).send({ message: error.message })
		}
	}
})

// make a collection of overrides for the routes
// format: "api-[method]-[override]"
var overrides = {
	'api-get-call-list': async function (req, res) {

		// The call list is generated from all contacts that include a home phone.  
		// It is sorted first by the contact’s last name, then by first name, 
		// and returned as an array of objects that each have the following JSON format:
		// {  "name": {    "first": "Harold",    "middle": "Francis",    "last": "Gilkey"},  "phone": "302-611-9148"}
		let records = await knex.raw('select DISTINCT JSON_EXTRACT(c.obj, "$.name") as name, JSON_EXTRACT(r.value, "$.number") as phone from contacts c join JSON_EACH(obj, "$.phone") r where JSON_EXTRACT(r.value, "$.type") = "home" order by JSON_EXTRACT(obj, "$.name.last") asc, JSON_EXTRACT(obj, "$.name.first") asc')
		res.send(records)
	},
	'api-get-load-test-contacts-in-bulk': async function (req, res) {
		// bulk import contacts
		bulkContacts.forEach(async (contact) => {
			await fastify.inject({ method: 'POST', url: '/api/v1/contacts', payload: contact })
		})
		res.send({ message: 'Ok! Bulk loaded some contacts.' })
	},
	'api-get-setup': async function (req, res) {
		// knex: if contacts table does not exist, create it
		let exists = await knex.schema.hasTable('contacts')
		if (!exists) {
			await knex.schema.createTable('contacts', function (t) {
				t.increments('id').primary();
				t.json('obj');
			})
		}
		res.send({ message: 'Ok! DB is ready' })
	}
}



// add a generic object to manipulate the database
// and to represent a record
function GenericRecord(type, init = {}) {
	this.type = type

	this.set = function (obj) {
		Object.assign(this, merge(this, obj))
		return this
	}

	this.load = async function (id) {
		if (!id) throw new Error('id is missing')
		let record = await knex(this.type).where('id', id).first()
		if (!record) throw new Error('record not found by id ' + id)
		this.id = record.id
		this.set(JSON.parse(record.obj))
	}

	this.save = async function () {
		let objToSave = this.validate()
		if (objToSave) {
			if (this.id) {
				await knex(this.type).where('id', this.id).update({ obj: JSON.stringify(objToSave) })
			} else {
				let record = await knex(this.type).insert({ obj: JSON.stringify(objToSave) })
				this.id = record[0]
			}
		}
	}

	this.delete = async function (id) {
		await knex(this.type).where('id', id).del()
	}

	this.validate = function () {
		let objToSave = { ...this }
		// get ajv validator for this type
		if (Validators[this.type](objToSave)) {
			return objToSave
		} else {
			throw new Error(Validators[this.type].errors[0].message)
		}
	}
}


// A test suite (integrated tests)
var passedTests = 0
var failedTests = 0
var lastRes = {}

async function testFastifyRoute(opt) {
	return fastify.inject(opt).then((res) => {
		opt.tests ??= []
		console.log('🍈', opt.desc)
		opt.tests.forEach((test) => {
			if (eval(test)) {
				passedTests++
				console.log(`✅ Passed test: ${test}`)
			} else {
				failedTests++
				console.log(`❌ Failed test: ${test} \n` + JSON.stringify(res.body) + '\n' + JSON.stringify(opt))
			}
			if (opt.cb) opt.cb(res.json())
		})
	})
}

var testMust = {}
testMust.return200 = [`res.statusCode === 200`]
testMust.notReturn200 = [`res.statusCode !== 200`]
testMust.return404 = [`res.statusCode === 404`]


var toTest = [
	{ desc: 'Check database setup', tests: testMust.return200, method: 'GET', url: '/api/v1/setup' },
	{ desc: 'Request URL not in ApiWhitelist', tests: testMust.return404, method: 'GET', url: '/api/v1/credit-cards' },
	{ desc: 'Post an invalid record', tests: testMust.notReturn200, method: 'POST', url: '/api/v1/contacts', payload: { name: 'test', email: 'nealtest' } },
	{
		desc: 'Post a valid record', tests: testMust.return200, method: 'POST', url: '/api/v1/contacts', payload: testContact,
		cb: (body) => {
			toTest.unshift(
				{ desc: 'Get last record with ID', tests: testMust.return200, method: 'GET', url: `/api/v1/contacts/${body.id}` },
				{ desc: 'Update last record with ID', tests: testMust.return200, method: 'PUT', url: `/api/v1/contacts/${body.id}`, payload: { name: { first: "bobby PUT test" } } },
				{ desc: 'Delete last record with ID', tests: testMust.return200, method: 'GET', url: `/api/v1/contacts/${body.id}` },
			)
		}
	},
	{ desc: 'Get call list', tests: testMust.return200, method: 'GET', url: '/api/v1/call-list' },
]

// run tests sequentially
function runSequentialTests(toTest) {
	test = toTest.shift()
	testFastifyRoute(test).then(() => {
		if (toTest.length) { runSequentialTests(toTest) } else {
			console.log(`----------------------`)
			console.log(`✅ Passed ${passedTests} tests`)
			console.log(`❌ Failed ${failedTests} tests`)
		}
	})
}

runSequentialTests(toTest)
