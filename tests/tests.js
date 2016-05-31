'use strict'

const test = require('tape')
const ae = require('../arbitrary-emitter.js')

test('on and emit', t => {
  const emitter = ae()
  const obj = {}
  let control = 0
  const fn = () => ++control
  emitter.on(obj, fn)
  emitter.emit(obj)
  t.is(control, 1, 'trigger')
  emitter.emit(obj)
  t.is(control, 2, 'trigger')
  emitter.on(obj, fn)
  emitter.emit(obj)
  t.is(control, 3, 'trigger')
  t.end()
})

test('once', t => {
  const emitter = ae()
  const obj = {}
  let control = 0
  emitter.once(obj, () => ++control)
  emitter.emit(obj)
  t.is(control, 1, 'trigger once')
  emitter.emit(obj)
  t.is(control, 1, 'automatic unsubscription')
  t.end()
})

test('off listener', t => {
  const emitter = ae()
  const obj = {}
  let control = 0
  emitter.on(obj, () => ++control)
  emitter.on(obj, () => ++control)
  emitter.emit(obj)
  t.is(control, 2, 'control')
  emitter.off(obj)
  emitter.emit(obj)
  t.is(control, 2, 'remove link from subscriptions')
  t.end()
})

test('off action', t => {
  const emitter = ae()
  const obj = {}
  let control = {
    a: 0,
    b: 0
  }
  const fn = () => ++control.b
  emitter.on(obj, () => ++control.a)
  emitter.on(obj, fn)
  emitter.emit(obj)
  t.is(control.a, 1, 'control a')
  t.is(control.b, 1, 'control b')
  emitter.off(obj, fn)
  emitter.emit(obj)
  t.is(control.a, 2, 'control a')
  t.is(control.b, 1, 'control b')
  t.end()
})

test('emit actions in order', t => {
  const emitter = ae()
  const obj = {}
  let control = ''
  emitter.on(obj, () => { control = control + 'a' })
  emitter.emit(obj)
  t.is(control, 'a', 'trigger')
  emitter.emit(obj)
  t.is(control, 'aa', 'trigger')

  emitter.on(obj, () => { control = control + 'b' })
  emitter.emit(obj)
  t.is(control, 'aaab', 'unsubscribe')

  emitter.on(obj, () => { control = control + 'c' })
  emitter.emit(obj)
  t.is(control, 'aaababc', 'unsubscribe')

  t.end()
})

test('emit with arguments', t => {
  const emitter = ae()
  const obj = {}
  let control = {
    a: 0
  }
  emitter.on(obj, a => { control.a = a })

  emitter.emit(obj, 1)
  t.is(control.a, 1)

  t.end()
})

test('once in a event with muliple listeners', t => {
  const emitter = ae()
  const out = []
  emitter.on('test', () => {
    out.push(1)
  })
  emitter.once('test', () => {
    out.push('a')
  })
  emitter.on('test', () => {
    out.push('finish')
  })
  emitter.emit('test')
  emitter.emit('test')
  t.is(out[0], 1)
  t.is(out[1], 'a')
  t.is(out[2], 'finish')
  t.is(out[3], 1)
  t.is(out[4], 'finish')
  t.end()
})

test('remove listener in a event with muliple listeners', t => {
  const emitter = ae()
  const out = []
  const f1 = () => out.push(1)
  const f2 = () => {
    out.push(2)
    emitter.off('test', f3)
  }
  const f3 = () => out.push(3)
  emitter.on('test', f1)
  emitter.on('test', f2)
  emitter.on('test', f3)
  emitter.emit('test')
  t.is(out[0], 1)
  t.is(out[1], 2)
  t.notOk(out[2])
  emitter.emit('test')
  t.is(out[2], 1)
  t.is(out[3], 2)
  t.end()
})
