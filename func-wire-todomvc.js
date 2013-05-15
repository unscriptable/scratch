(function (define) {
define(function (require) {

	var create = require('wire/create'),
		connect = require('wire/connect'),
		on = require('wire/on'),
		aop = require('wire/aop'),
		cola = require('wire/cola'),
		dom = require('wire/dom'),
		compose = require('wire/compose'),
		render = require('wire/dom/render')
		domReady = require('domReady!');

	var theme, root,
		createView, createForm, listView, controlsView, footerView,
		todoStore, todos, todoController,
		parseForm, cleanTodo, generateMetadata,
		toggleEditingState, setTodosTotalState, setTodosRemainingState, setTodosCompletedState;

	todos = create(require('cola/Hub'), {
		strategyOptions: {
			validator: require('create/validateTodo')
		}
	});

	theme = require('css!theme/base.css');

	root = dom.byId('todoapp');

	createView = render(
		require('text!create/template.html'),
		require('i18n!create/strings')
	);

	createForm = dom.first('form', createView);

	listView = render(
		require('text!list/template.html'),
		require('i18n!list/strings'),
		require('css!list/structure.css')
	);

	controlsView = render(
		require('text!controls/template.html'),
		require('i18n!controls/strings'),
		require('css!controls/structure.css')
	);

	footerView = render(
		require('text!footer/template.html'),
		require('i18n!footer/strings')
	);

	todoStore = create(require('cola/adapter/LocalStorage'), 'todos-cujo');

	parseForm = require('cola/dom/formToObject');

	cleanTodo = require('create/cleanTodo');

	generateMetadata = require('create/generateMetadata');

	todoController = create(require('controller'))
		.properties({
			todos: todos,
			createTodo: compose(parseForm, todos.add),
			removeTodo: todos.remove,
			updateTodo: todos.update,
			querySelector: dom.first,
			masterCheckbox: dom.first('#toggle-all', listView),
			countNode: dom.first('.count', controlsView),
			remainingNodes: dom.all('#todo-count strong', controlsView)
		});

	toggleEditingState = create(require('wire/dom/transform/toggleClass'), {
		classes: 'editing'
	});

	setTodosTotalState = create(require('wire/dom/transform/cardinality'), {
		node: root,
		prefix: 'todos'
	});

	setTodosRemainingState = create(require('wire/dom/transform/cardinality'), {
		node: root,
		prefix: 'remaining'
	});

	setTodosCompletedState = create(require('wire/dom/transform/cardinality'), {
		node: root,
		prefix: 'completed'
	});

	domReady(function () {

		// deferred insert works as long as all UI components don't rely on
		// the nodes being in the dom right away. (a significant number
		// of third-party widgets will fail here, btw!)

		dom.insert(createView, root);

		dom.insert(listView, createView, 'after');

		dom.insert(controlsView, listView, 'after');

		dom.insert(footerView, root, 'after');

		on(createView, 'submit:form', todoController, 'createTodo');

		on(listView, 'click:.destroy', todoController, 'removeTodo');

		on(listView, 'change:.toggle', todoController, 'toggleAll');

		on(listView, 'dblClick:.view', todos, 'edit');

		on(listView, 'change,focusout:.edit', todos, 'submit');

		on(controlsView, 'click:#clear-completed', todoController, 'removeCompleted');

	});

	connect(todoController, 'updateTotalCount', setTodosTotalState);

	connect(todoController, 'updateRemainingCount', setTodosRemainingState);

	connect(todoController, 'updateCompletedCount', setTodosCompletedState);

	connect(todos, 'onChange', todoController, 'updateCount');

	connect(todos, 'onEdit',
		compose(
			todos.findNode.bind(todos),
			toggleEditingState.add, // doesn't need to be bound
			todoController.beginEditTodo.bind(todoController)
		)
	);

	connect(todos.onSubmit,
		compose(
			todos.findNode.bind(todos),
			toggleEditingState.remove, // doesn't need to be bound
			todos.findItem.bind(todos),
			todoController.endEditTodo.bind(todoController)
		)
	);

	connect(todos, 'onAdd', createForm, 'reset');

	aop.before(todos, 'add', compose(cleanTodo, generateMetadata));

	cola.bind(todoStore, todos);

	cola.bind(listView, todos, {
		comparator: 'dateCreated',
		bindings: {
			text: 'label, .edit',
			complete: [
				'.toggle',
				{ attr: 'classList', handler: require('list/setCompletedClass') }
			]
		}
	});

	return todoController;

});
}(
	typeof define == 'function' && define.amd
		? define
		: function (factory) { module.exports = factory(require); }
));

define(function () {

	return function (dep1, dep2, dep3) {

		return {

		};

	};

});