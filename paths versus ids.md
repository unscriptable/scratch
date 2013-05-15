# paths versus ids

## questions

1. should main modules' ids be cached (and optimized) in expanded or short form?
	* A: expanded. here why...
		* the runtime cache should have the same ids as the optimizer file
		  so the same rules can apply to optimized files as unoptimized
		* an AMD loader that doesn't understand packages can still use the
		  optimized file if the ids are expanded
		* this allows for greater compatibility and simpler loaders

2. should plugin ids be cached in expanded or short form?
	* A: expanded. same reasons as #1
	* if curl must load a file that was optimized by a different build tool,
	  then it has to be able to still transform from short form to expanded.
	  pluginPath will still work in this case.
	* cram will remove the need for plugins in the optimized file if it can:
	  plugins that compile to AMD allow this, plugins that do not participate
	  in the build do not. some plugins may still require a run-time plugin
	  even inside an optimized file (these do not compile to AMD).
	* when plugins are compiled to AMD, their module id does not need to change
	* if another loader loads a cram.js-optimized file, it can continue to
	  use it's own plugins since any curl plugins will have unique names
	  (since they'll be prefixed with the pluginPath)
	* TODO: rename pluginPath to pluginPrefix

3. should pluginPath/pluginPrefix be an id transform or a path transform?
	* A: id transform since urls don't belong in the built files
	* TODO: rename pluginPath to pluginPrefix

4. should users be able to put url paths into define() and require() dep lists?
	* there's a subtle distinction between ids and [url] paths.
	* what does node do?
		* relative paths? yes
		* parent paths? yes (even out of current project or package)
		* http requests? no
	* what should curl do?
		* relative paths? yes
		* parent paths? yes (but curl should throw if reaching outside of a
		  	package since that has to be a dev mistake)
		* http requests? yes

5. can curl detect when the dev is using urls in require()/define() dep lists
  instead of ids?
	* yes: check for leading /, protocol, or dots that go beyond parentId

6. why does curl have to use ids in the cache, rather than urls?
	* optimized files, of course, must not use urls since the file could be
	  deployed to any url/path.  baseUrl just needs to be adjusted.
	* it seems that a) the cache's keys and b) the module ids in optimized files
	  should be the same, so that multiple optimized file can coordinate

7. what needs to get fixed in curl?
	* fetchResourceDef()
	* toAbsId()
	* toUrl()
	* don't allow baseUrl to be overridden by packages since that messes all the things
	* create tests to find out
	* document id-to-url process
	* document how the process can cause dups when devs use url bits in their ids

## reasons to use paths config object

1. as psuedo-packages: name, location, but no main
	* example:
	  `paths: { "foo": "js/libs/foo", "bar": "js/libs/bar" }`
	  is semantically similar to
	  `packages: [{ name: "foo", location: "js/libs/foo" }, { name: "bar"... }]`

2. as module aliases
	* example 1:
	  `paths: { "jquery": "//mycdn.com/js/libs/jquery1.7.1.min" }`
	* example 2:
	  `paths: { "datastore": "js/libs/dojo/data/JsonRest" }`
	* example 3 (godaddy):
	  `paths: { "sf/datastore": "js/libs/sf/${version}/datastore" }`

3. as library shims
	* example 1:
	  `paths: { "dojo/io/xhr": "my/shims/dojo/io/xhr" }`
	* example 2:
	  `paths: { "curl/plugin/i18n": "requirejs/i18n" }`


# The hows and whys of paths vs ids

1.	If a module id contains path information (slashes), it is less
	relocatable since that path structure must be maintained.
2.	It's ok to have some paths / slashes in related groups of modules if
	they're managed as a single unit -- a "package" in CommonJS terms --
	since a package's path information is split into two parts by
	AMD's packages configuration specification.  Specifically, the
	`location` parameter denotes the split between the url part of
	the path and the id part.
3.	Packages can be relocated as needed as long as the id part of their
	paths never changes.  (IOW: as long as the internal folder structure of the
	package is not changed.)  The id part of the path always starts with
	the same name -- the name of the package -- as a means of namespacing
	the modules in the package.  (The package author may, of course,
	decide to change the folder structure.  If any modules that form the
	public API of the package are relocated, the dev is forced to change
	his code... but this is a separate issue: package versioning!)
4.	One of the most popular use cases of AMD's paths config object is to denote
	a similar split of the path into url / id. The result is essentially
	the same as using packages.
	* example:
	  `paths: { "foo": "js/libs/foo", "bar": "js/libs/bar" }`
	  is semantically similar to
	  `packages: [{ name: "foo", location: "js/libs/foo" }, { name: "bar"... }]`
5.	Summary of path url vs path id: if a module reference contains id path
	information, that is fine -- and necessary for namespacing in any
	non-trivial project. However, if a module reference contains url
	path information, the module becomes less relocatable.
6.	Files with multiple modules, such as compiled files, must identify
	the modules.  (IOW: you can't have anonymous modules in compiled files.)
7.	Url path information in compiled files limits the relocatability of
	the compiled files.  (Actually, if the entirety of the app is compiled
	into a single file, it doesn't matter what the paths look like since
	the loader won't have to find the modules.)
8.	There are several use cases for making compiled files relocatable:
	* Compiled packages on CDN.
	* Pre-compiled packages in `dist/` folders of projects.  Code minifiers
		would automatically remove unused parts of the compiled packages.
		Load times during development could improve drastically!
	* Cache-busting via version-stamped deployment folders. e.g.
		`v-1.3.2/client/lib/wire`
9. curl.js needs to support id-to-compiled-file mappings before any of
 	the use cases above are feasible.



## The problem: how to apply ../

At the moment, the algorithm to resolve relative ids does not use baseUrl.

things we may find in a dependency list:

* looks like an absolute id. ex: "pkgB/path/modB", "when"
	- check if it's been aliased by a path
	- check if it's in a package
	- default: it's a path from baseUrl
* looks like a relative id or url. ex: "../modC", "../../lib/bar"
	- try to resolve up to the top level of the package (or path alias)
	- if it tries to go past top level:
		- fail if it's a package?
		- resolve up to baseUrl if it's not
		- what if there's a flag that allows navigation into baseUrl
			and/or throws if there's no path or package found for an id???
* looks like an url. ex: "/foo/bar/something", "http://cdn/another/thing"
	- just use it as is. the compiler will do the same (but it still
		could attempt to embed it)




# Analysis of module ids and paths vs packages

## Mobility of optimized files

An optimized file is "compiled" in the sense that it assumes a static
snapshot of the world within it.  Therefore, you wold expect that module
ids that reference relative modules would be normalized.  A normalized
id has had its relative path references (`./` and `../`) resolved.

However, if a relative reference navigates into baseUrl (because it traverses
several parent paths via `../`), a portion of baseUrl would be captured in the
optimized file.  This would seem to limit how/where the optimized file
is deployed.

## Compile-time vs. run-time path resolution.

It's possible that a dev wants the path to a relative module to be resolved at
run time instead of compile time.  Should the compiler assume that paths
that would traverse into baseUrl are to be resolved at run time?  In
other words, the compiler would leave the portions of the relative
paths as `./` or `../` references.  (Possibly, it would only leave the
portions that would traverse into baseUrl as `./` and `../`.)

Initially, I don't like the feel of this since the ids in optimized
files are no longer identical to the ids in curl's cache.  (I haven't
yet proven this is necessary or even beneficial. I just seem to
remember thinking this would solve some potential problems.)

If the dependent module is compiled into the same optimized file as the
requiring module, then run-time resolution will work under the following
circumstances:

1. The baseUrl at run-time has at least as many path segments (allows at
	least as many `../` traversals) as was left in the optimized file.
2. If the dependent module was not baked into the optimized file,
	its relative run-time location is exactly the same as compile time.

Furthermore, if the dev wishes to create multiple optimized files, it seems
that she/he would have to ensure that all of the optimized files are
compiled with exactly the same baseUrl and are deployed to the same
folder or else relative path references will fail.

Actually, there is an alternative to co-locating the optimized files
under most (reasonable?) circumstances: provide a different paths
config when using the optimized files.  This, however, violates our
desire to keep the dev environment and production environment as
similar as possible.

Regarding multiple optimized files, there's one more problem to solve.
How does curl.js know if an optimized file contains a given module?
There needs to be a mechanism to map module ids to optimized files.
At run-time, curl could fabricate a dependency to the optimized file
to ensure the module got loaded (and cached).

The mapping of modules to optimized files doesn't need to be complex.

The real crime here is not so much the complexity of the code needed
in curl.js.  It's the complexity of the problem domain in the dev's brain.

Note that use of a package-based module scheme has none of
these complexities.  Since modules in one package should never relatively-
reference modules in another package (imho?), they can never navigate
into the baseUrl.  Compiled


id-to-url resolution (ignores resources/modules loaded by plugins):

* normalize/toAbsId:
	* reduceLeadingDots of id against parentId
		- if there are too many dots (path goes beyond parent), it's a url
			- return reduceLeadingDots of id against baseUrl + parentId;
	* if id is a url (starts with dots or slash or protocol)
		- pathInfo = { config: userCfg, url: url }
	* if not a url, id-to-id transform here.
		- main module expansion
		- plugin prefix expansion
		- coordinate main module expansion with plugin expansion
			- main module expansion happens first
		- future: other transforms?
* pathInfo/toUrl:
	* if not a url, get path info
		- package.main(?) & config || userCfg
		- alias (need to fix curl so it still gets config if alias is deep in a package)
			- use pathMap/pathRx to convert from id to url (why doesn't this work for godaddy?)
		- url
		- bundle(?)
* if bundle, fetch bundle and chain promise
* otherwise, fetch module

plugin resource resolution:

* if plugin has no normalize method,
	- just pass resource name into plugin
* otherwise, pass normalize callback to plugin's normalize method
	- normalize callback should obey all of the rules for id-to-url resolution
* pass toUrl method on require callback passed to plugin
* cache resource according to plugin's dynamic property

Syntax for configuring bundles?

* the trick is how to specify them, but only use them when they're available
	(production time), not when you're not compiling them (dev time)
* godaddy might appreciate if they use a syntax identical to paths
* what about manifest files? what can we do with those?

wire!spec:

* toAbsId
	* split into wire + spec
	* resolve wire -> wire/wire
	* join back to wire/wire!spec
* resolvePathInfo
	* split into wire/wire + spec (redundant!)
	* submit spec to wire.normalize -> normalized
	* rejoin wire/wire + normalized
* resolveUrl
	* if wire/wire!normalized path mapping, transform to url
	* if not absolute url, prepend baseUrl

wire:

* toAbsId
	* (doesn't split)
	* resolve wire -> wire/wire
* resolvePathInfo
	* if wire/wire path mapping, transform to url
* resolveUrl
	* if not absolute url, prepend baseUrl
