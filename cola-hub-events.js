define({

	hub1: {
		create: {
			module: 'cola/Hub',
			args: [
				{ $ref: 'resource!restful/endpoint' },
				{
					eventsHub: { $ref: 'events1' }
				}
			]
		}
	},

	events1: {},

	plugins: [
		{ module: 'wire/cola' }
	]
});


define({

	hub2: {
		create: {
			module: 'cola/Hub',
			args: { $ref: 'resource!restful/endpoint' }
		},
		init: {
			setEventsHub: { $ref: 'events2' }
		}
	},

	events2: {},

	plugins: [
		{ module: 'wire/cola' }
	]
});
