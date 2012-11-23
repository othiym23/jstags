## jstags

Using tagbar in vim is awesome. Using ctags with JavaScript is not awesome.
`jstags` uses the power of [Esprima](http://esprima.org) to make tagbar more
awesome.

### installation

```
npm install -g jstags
```

### usage

```
jstags *.js
```

Right now, the results just get dumped to stdout. Eventually it'll be closer
to command-line compatible with Exuberant CTags. Probably after it actually works.
