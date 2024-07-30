/**
 * Interface for performing CRUD for resources
 */
import { Repository } from '../model/';

export class Collection {
  repository: Repository;

  constructor(repository: Repository) {
    this.repository = repository;
  }

  read() {}

  write() {}

  update() {}

  delete() {}
}