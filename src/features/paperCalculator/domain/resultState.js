export function resultState(status, data = {}, errors = [], warnings = []) {
  return { status, data, errors, warnings }
}

export function emptyResult(data = {}) {
  return resultState('empty', data)
}

export function invalidResult(errors, data = {}, warnings = []) {
  return resultState('invalid', data, errors, warnings)
}

export function readyResult(data, warnings = []) {
  return resultState('ready', data, [], warnings)
}

export function noFitResult(data, warnings = []) {
  return resultState('no-fit', data, [], warnings)
}

