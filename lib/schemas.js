import Ajv from 'ajv'
import addFormats from 'ajv-formats'

// Load all schemas in schemas/*.json
const modules = import.meta.glob('../schemas/*.json', { eager: true, import: 'default' })
export const schemas = Object.values(modules)
export const BaseURI = modules['../schemas/schema.json'].$id

// Create a new Ajv validator instance with all schemas loaded
const ajv = new Ajv({
  schemas,
  useDefaults: true,
  allErrors: true,
  strict: true
})
addFormats(ajv)
ajv.addKeyword('symbol')
ajv.addKeyword('category')

// Delegate property access to the schema definition
const DelegateToDefinition = {
  get (target, property) {
    return target[property] ?? target.definition[property]
  },

  has (target, property) {
    return property in target || property in target.definition
  }
}

// Class to browse schemas, resolve refs, and validate data
export class Schema {
  static resolve ($ref, $id = BaseURI) {
    const { href } = new URL($ref, $id)
    const validator = ajv.getSchema(href)

    if (validator === undefined) throw new TypeError('Schema not found: ' + href)

    // Schema definition is a primitive, just return it
    if (typeof validator.schema !== 'object') return validator.schema

    // Create a new proxy to the schema definition
    if (!validator.proxy) validator.proxy = Schema.proxy(href, validator.schema)

    return validator.proxy
  }

  static proxy ($id, definition) {
    return new Proxy(new Schema($id, definition), DelegateToDefinition)
  }

  constructor ($id, definition) {
    this.$id = $id
    this.definition = new Proxy(definition, this)
  }

  resolve ($ref = this.definition.$ref, $id = this.$id) {
    return Schema.resolve($ref, $id)
  }

  resolveAnyOf () {
    return this.definition.anyOf?.map(ref => ref.resolveAnyOf())?.flat() || [this]
  }

  arrayItem (index) {
    const items = this.definition.items
    return Array.isArray(items) ? items[index] : items
  }

  validate (data) {
    const validator = ajv.getSchema(this.$id)
    const valid = validator(data)
    const errors = validator.errors
    return { valid, errors }
  }

  // This instance acts as a Proxy to resolve $refs in the schema definition
  get (target, property) {
    const value = target[property]

    if (Array.isArray(value)) {
      // Schema definition returns an array for this property, return the array with all refs resolved
      return value.map((item, i) => {
        if (typeof item === 'object') {
          return Schema.resolve(item.$ref || this.join(`${property}/${i}`), this.$id)
        } else {
          return item
        }
      })
    } else if (value !== null && typeof value === 'object') {
      // Schema definition returns an object for this property, return the subschema and proxy it
      return Schema.proxy(this.join(property), value)
    } else if (value !== undefined) {
      // Schema definition returns a value for this property, just return it
      return value
    } else if (target.$ref) {
      // Schema includes a ref, so delegate to it
      return Schema.resolve(target.$ref, this.$id)[property]
    }
  }

  join (path, $id = this.$id) {
    const url = new URL($id)
    url.hash = [url.hash, path].join('/')
    return url.toString()
  }
}

export const schema = Schema.resolve('#')
