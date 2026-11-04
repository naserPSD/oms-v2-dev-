import { SelectQueryBuilder } from 'typeorm';
import { ObjectLiteral } from 'typeorm/common/ObjectLiteral';

export class APIFeatures<T extends ObjectLiteral> {
  private entityAlias: string;

  constructor(
    private query: SelectQueryBuilder<T>,
    private queryString: any,
  ) {
    // Automatically determine the alias of the entity being queried
    this.entityAlias = this.query.alias;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'params'];
    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    const parsedQuery = JSON.parse(queryStr);

    // Apply filter using where conditions
    Object.keys(parsedQuery).forEach((key) => {
      this.query.andWhere(`${this.entityAlias}.${key} = :${key}`, {
        [key]: parsedQuery[key],
      });
    });

    return this;
  }

  sort() {
    if (this.queryString?.sort && this.queryString.sort !== 'undefined') {
      // Split the sort query parameter into an array of fields
      const sortBy = this.queryString.sort.split(',').map((field: string) => {
        const [sortField, sortOrder = 'ASC'] = field.trim().split(':');
        return {
          field: sortField.includes('.')
            ? sortField
            : `${this.entityAlias}.${sortField}`, // Handle related entity fields
          order: sortOrder.toUpperCase(), // Default sort order is ASC
        };
      });

      // Apply the sorting for each field
      sortBy.forEach(({ field, order }) => {
        this.query = this.query.addOrderBy(field, order as 'ASC' | 'DESC');
      });
    } else {
      // Default sorting if no sort parameter is provided
      // const defaultSortField = `${this.entityAlias}.createdAt`; // Ensure this field exists in the entity
      const defaultSortField = `${this.entityAlias}.id`; // Ensure this field exists in the entity
      this.query = this.query.orderBy(defaultSortField, 'DESC');
    }

    return this;
  }

  searching() {
    let params: Record<string, any> = {};
    const queryParams = this.queryString.params;
    if (queryParams) {
      try {
        if (typeof queryParams === 'string') {
          params = JSON.parse(queryParams);
        } else if (typeof queryParams === 'object') {
          params = queryParams;
        }
      } catch (error) {
        console.error('Invalid JSON in params:', error, queryParams);
        throw new Error('Invalid JSON in params');
      }
    }

    // ✅ Fallback: check top-level query for search keys
    if (!queryParams) {
      params = { ...this.queryString };
      delete params.page;
      delete params.limit;
      delete params.sort;
      delete params.fields;
    }

    // Apply filter using where conditions
    Object.keys(params).forEach((key) => {
      if (key === 'name') {
        this.query.andWhere(`${this.entityAlias}.name LIKE :name`, {
          name: `%${params[key].trim()}%`,
        });
      } else if (
        typeof params[key] === 'string' &&
        (params[key].trim() === 'true' || params[key].trim() === 'false')
      ) {
        this.query.andWhere(`${this.entityAlias}.${key} = :${key}`, {
          [key]: params[key].trim() === 'true',
        });
      } else if (
        key === 'search' ||
        key === 'startDate' ||
        key === 'endDate' ||
        key === 'sort' ||
        key === 'invoiceNo' ||
        key === 'transactionId' ||
        key === 'paymentStatus'
      ) {
      } else if (key === 'createdAt') {
        this.query.andWhere(`DATE(${this.entityAlias}.${key}) = :${key}`, {
          [key]: params[key].trim(),
        });
      } else if (key === 'updatedAt') {
        this.query.andWhere(`DATE(${this.entityAlias}.${key}) = :${key}`, {
          [key]: params[key].trim(),
        });
      } else {
        this.query.andWhere(`${this.entityAlias}.${key} = :${key}`, {
          [key]: params[key],
        });
      }
    });

    return this;
  }

  limitFields() {
    if (this.queryString?.fields && this.queryString.fields !== 'undefined') {
      // Split the fields query parameter into an array of fields
      const fields = this.queryString.fields
        .split(',')
        .map((field) => field.trim());

      // Separate fields for the main entity and related entities
      const mainEntityFields = fields.filter((field) => !field.includes('.'));
      const relatedEntityFields = fields.filter((field) => field.includes('.'));

      // Select fields for the main entity
      if (mainEntityFields.length > 0) {
        this.query = this.query.select(
          mainEntityFields.map((field) => `${this.entityAlias}.${field}`),
        );
      }

      // Add fields for related entities
      relatedEntityFields.forEach((field) => {
        this.query.addSelect(field); // Use the full field path (e.g., 'category.name')
      });
    } else {
      // If no fields are specified, select all by default with relations included
    }

    return this;
  }

  paginate() {
    const page = this.queryString?.page * 1 || 1;
    const limit = this.queryString?.limit * 1 || 10;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).take(limit);
    return this;
  }

  getQuery() {
    return this.query;
  }
}
