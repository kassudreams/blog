export class ECS {
  constructor() {
    this.entities = new Map();
    this.components = {};
    this.systems = [];
    this.nextEntityId = 0;
  }

  createEntity() {
    const id = this.nextEntityId++;
    this.entities.set(id, new Set());
    return id;
  }

  registerComponent(name, componentClass) {
    this.components[name] = {
      class: componentClass,
      store: new Map()
    };
  }

  addComponent(entity, componentName, data) {
    const component = new this.components[componentName].class(data);
    this.components[componentName].store.set(entity, component);
    this.entities.get(entity).add(componentName);
    return component;
  }

  registerSystem(system) {
    system.ecs = this;
    this.systems.push(system);
  }

  update(delta) {
    this.systems.forEach(system => system.update(delta));
  }

  queryEntities(componentNames) {
    return Array.from(this.entities.keys()).filter(entityId => {
      const entityComponents = this.entities.get(entityId);
      return componentNames.every(name => entityComponents.has(name));
    });
  }
}