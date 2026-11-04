import { Query } from 'mongoose';

export class MongoAPIFeatures<T> {
  constructor(
    private query: Query<T[], T>,
    private queryString: any,
  ) {}

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'params'];
    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    if (this.queryString?.sort && this.queryString.sort !== 'undefined') {
      const sortBy: Record<string, 1 | -1> = {};

      this.queryString.sort.split(',').forEach((field: string) => {
        const [sortField, sortOrder = 'ASC'] = field.trim().split(':');
        const finalField = sortField === 'id' ? '_id' : sortField;
        sortBy[finalField] = sortOrder.toUpperCase() === 'DESC' ? -1 : 1;
      });

      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort({ _id: -1 });
    }

    return this;
  }

  searching() {
    let params: Record<string, any> = {};
    const queryParams = this.queryString.params;

    if (queryParams) {
      try {
        params =
          typeof queryParams === 'string'
            ? JSON.parse(queryParams)
            : queryParams;
      } catch (error) {
        throw new Error('Invalid JSON in params');
      }
    } else {
      params = { ...this.queryString };
      ['page', 'limit', 'sort', 'fields'].forEach((el) => delete params[el]);
    }

    const mongoFilter: Record<string, any> = {};

    Object.keys(params).forEach((key) => {
      if (key === 'name') {
        mongoFilter[key] = { $regex: params[key].trim(), $options: 'i' };
      } else if (params[key] === 'true' || params[key] === 'false') {
        mongoFilter[key] = params[key] === 'true';
      } else if (['search', 'startDate', 'endDate'].includes(key)) {
      } else if (['createdAt', 'updatedAt'].includes(key)) {
        const date = new Date(params[key].trim());
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        mongoFilter[key] = { $gte: date, $lt: nextDay };
      } else {
        mongoFilter[key] = params[key];
      }
    });

    this.query = this.query.find(mongoFilter);
    return this;
  }

  limitFields() {
    if (this.queryString?.fields && this.queryString.fields !== 'undefined') {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    const page = this.queryString?.page * 1 || 1;
    const limit = this.queryString?.limit * 1 || 10;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }

  getQuery() {
    return this.query;
  }
}
