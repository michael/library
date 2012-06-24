This document is best viewed in [Prose](http://prose.io/#substance/library/master/README.md).

Library
=======

The Substance Library is different from traditional libraries, in that there are no books stored but digital documents that are always up-to-date. Everyone with permission can read and write documents at any time. Open 24/7.


API
=======

It's fairly easy to use.


Write Document
-------

```bash
$ curl -XPOST http://localhost:7007/write -d '{
    "id": the-substance-composer,
    "created_at": "2012-04-10T15:17:28.946Z",
    "updated_at": "2012-04-10T15:17:28.946Z",
    "head": "/cover/1",
    "tail": "/section/2",
    "rev": 2,
    "nodes": {
      "/cover/1": {
        "type": ["/type/node", "/type/cover"],
        "title": "The Substance Composer",
        "abstract": "Building an editor for everyone is impossible. Go create your own.",
        "next": "/section/2",
        "prev": null
      },
      "/section/2": {
        "type": ["/type/node", "/type/section"],
        "name": "Start typing today.",
        "prev": "/cover/1",
        "next": null
      }
    },
    "operations": [
      {"command": "node:insert", "params": {"user": "michael", "type": "cover", "attributes": {"title": "The Substance Composer" }}},
      {"command": "node:insert", "params": {"user": "michael", "type": "section", "attributes": {"name": "Start typing today."}}}
    ]
}'
```


Read Document
-------

```bash
$ curl -XGET http://localhost:7007/read/the-substance-composer
```


Update a document incrementally
-------

```bash
$ curl -XPUT http://localhost:7007/update -d '{
   "id": "the-substance-composer",
   "operations": [
      {"command": "node:insert", "params": {"user": "michael", "type": "text", "attributes": {"content": "some text."}}},
    ]
}'
```


Search for Documents
-------

To be implemented.