NodeAdapter needs
---

* mappings from item properties to nodes/attributes (transform function)
	- property
	- selector
	- (not event or transform)
* default nodeFinder if a querySelector isn't provided
* default property guesser when not specified (text / innerText / textContent)
* oocss helper


NodeListAdapter needs
---

* oocss helper
* default nodeFinder if a querySelector isn't provided
	- find and extract template node
* add/remove/update
	- dom insertion
* identifier/comparator
* item-from-event


Add event
---

1. create a new template node
	- cola/dom/objectToDom
2. merge data into template node
	- cola/dom/objectToDom
3. determine position of data/node
	- could this be pushed from source of event?
4. insert template node into container at correct position
	- wire/lib/dom/base placeAt()

(steps 2 and 4 can be swapped)


If we don't keep a copy of the data close to the dom
---

* sorting and finding no longer work
	- comparators and identifiers need to work against original items
	- ways to fix this:
		- create comparators and identifiers to work on nodes
