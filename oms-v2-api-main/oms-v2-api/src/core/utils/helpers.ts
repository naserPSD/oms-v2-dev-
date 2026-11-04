import {
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE,
} from '@common/constants/file-constants';
import { AwsS3Service } from '@config/aws-s3.service';
import { Meta } from '@interfaces/meta.interface';

import { BadRequestException } from '@nestjs/common';
import { convert } from 'libreoffice-convert';
import { User } from '../../../src/module/users/entities/user.entity';
import axios from 'axios';
import { UserContextService } from '@module/auth/user-context.service';
import * as moment from 'moment-timezone';

export class Helpers {
  /**
   * Constructor for the Helpers class.
   * @param {AwsS3Service} awsS3Service - The service for interacting with AWS S3.
   * @param {UserContextService} userContextService - The service for getting the current user.
   */
  constructor(
    private readonly awsS3Service: AwsS3Service,
    private readonly userContextService: UserContextService,
  ) {}
  static makePaginationData(query: any, queryResult: any): Meta {
    const limit = query?.limit ? parseInt(query?.limit) : 10;
    return {
      page: query?.page ? parseInt(query?.page) : 1,
      total: queryResult.total ?? 0,
      limit,
      lastPage: Math.ceil(queryResult.total / limit),
      resultRows: queryResult.data?.length ?? 0,
    };
  }

  static copyObject(object: any): any {
    return JSON.parse(JSON.stringify(object));
  }

  static copyProperies(from: any, to: any): any {
    return Object.assign(to, from);
  }

  static entityMapped(fromEntity: any, toEntity: any): <T>() => T {
    const dto = new toEntity();
    Object.entries(dto).forEach(([key, value]) => {
      dto[key] = fromEntity[key];
    });

    return dto;
  }

  static async convertFileUrlToBase64(fileUrl: string): Promise<string> {
    if (!fileUrl) {
      throw new BadRequestException('File URL is required');
    }
    if (typeof fileUrl !== 'string') {
      throw new BadRequestException('File URL must be a string');
    }
    try {
      // Fetch the file from the URL
      const response = await axios.get(fileUrl, {
        responseType: 'arraybuffer', // Ensure the response is returned as binary data
      });

      // Convert the binary data to a Base64 string
      const base64String = Buffer.from(response.data).toString('base64');

      return base64String;
    } catch (error) {
      console.error('Error converting file to Base64:', error.message);
      throw new Error('Failed to convert file to Base64');
    }
  }

  static async convertDocxToPdf(input: Buffer): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      convert(input, '.pdf', undefined, (err, result) => {
        // if (err) reject(err);
        if (err) {
          console.error('Error converting DOCX to PDF:', err);
          return reject(new Error('Failed to convert DOCX to PDF'));
        } else resolve(result);
      });
    });
  }

  // static diffInMinutes(
  //   date1: Date,
  //   date2Str: string,
  //   timezone?: string,
  // ): number {
  //   const d1 = new Date(date1);
  //   const d2 = new Date(`${d1.toISOString().split('T')[0]}T${date2Str}`);
  //   return Math.max(0, Math.floor((d1.getTime() - d2.getTime()) / 60000));
  // }

  static diffInMinutes(
    date1: Date,
    date2Str: string,
    timezone = 'Asia/Dhaka',
  ): number {
    const checkIn = moment(date1).tz(timezone);
    const shift = moment.tz(
      `${checkIn.format('YYYY-MM-DD')} ${date2Str}`,
      'YYYY-MM-DD HH:mm:ss',
      timezone,
    );
    return Math.max(0, checkIn.diff(shift, 'minutes'));
  }

  static async convertDocxToPdfIfApplicable(file: Express.Multer.File) {
    // Check if the file is a DOCX file
    let uploadingFile: any = null; // Initialize uploadingFile variable
    // Check if the file is a DOCX file
    if (
      file.mimetype ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || // .docx
      file.mimetype === 'application/msword' // .doc
    ) {
      // Convert DOCX file to PDF
      const pdfBuffer = await this.convertDocxToPdf(file.buffer);
      // Create an object with the required properties for uploadMedia
      uploadingFile = {
        originalname: file.originalname.replace('.docx', '.pdf'), // Change extension to .pdf
        mimetype: 'application/pdf', // Set the correct mimetype for PDF
        buffer: pdfBuffer, // Use the converted PDF buffer
      };
    }
    // Check if the file is a PDF file
    if (file.mimetype === 'application/pdf') {
      uploadingFile = file; // Assign the original PDF buffer to uploadingFile
    }
    return uploadingFile; // Return the uploadingFile object
  }

  static upload_media(file: any): Promise<{ Location: string; key: string }> {
    const s3 = new AwsS3Service();
    return s3.uploadFile(file);
  }

  static isString<T>(value: T | string): value is string {
    return typeof value === 'string';
  }

  static isObject<T>(value: T | object): value is object {
    return typeof value === 'object' && value !== null;
  }

  static isNumber<T>(value: T | number): value is number {
    return typeof value === 'number';
  }

  static isArray<T>(value: T | any[]): value is any[] {
    return Array.isArray(value);
  }

  static isBoolean<T>(value: T | boolean): value is boolean {
    return typeof value === 'boolean';
  }

  static isFunction<T>(value: T | Function): value is Function {
    return typeof value === 'function';
  }

  static isUndefined<T>(value: T | undefined): value is undefined {
    return typeof value === 'undefined';
  }

  static isNull<T>(value: T | null): value is null {
    return value === null;
  }

  static isSymbol<T>(value: T | symbol): value is symbol {
    return typeof value === 'symbol';
  }

  static isBigInt<T>(value: T | bigint): value is bigint {
    return typeof value === 'bigint';
  }

  static isDate<T>(value: T | Date): value is Date {
    return value instanceof Date;
  }

  static isRegExp<T>(value: T | RegExp): value is RegExp {
    return value instanceof RegExp;
  }

  static isError<T>(value: T | Error): value is Error {
    return value instanceof Error;
  }

  static isNullish<T>(value: T | null | undefined): value is null | undefined {
    return value === null || value === undefined;
  }

  static isPrimitiveArray<T>(value: T | any[]): value is any[] {
    return Array.isArray(value) && value.every(Helpers.isPrimitive);
  }

  static isPrimitive<T>(
    value: T | string | number | boolean | symbol | bigint | null | undefined,
  ): value is string | number | boolean | symbol | bigint | null | undefined {
    return (
      value === null ||
      (typeof value !== 'object' && typeof value !== 'function')
    );
  }

  static getCurrentUser(userContextService: UserContextService): User {
    return userContextService.getUser();
  }

  static getLoggedUserId(userContextService: UserContextService): number {
    return userContextService.getUserId();
  }

  getCurrentUser(): User {
    return this.userContextService.getUser();
  }

  getLoggedUserId(): number {
    return this.userContextService.getUserId();
  }

  static validateFile(
    file: Express.Multer.File,
    allowedMimeTypes: string[] = ALLOWED_FILE_TYPES,
    maxSizeInBytes: number = MAX_FILE_SIZE,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    // Check file type
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Only ${allowedMimeTypes.join(', ')} are allowed.`,
      );
    }

    // Check file size
    if (file.size > maxSizeInBytes) {
      throw new BadRequestException(
        `File size exceeds the limit of ${maxSizeInBytes / (1024 * 1024)} MB`,
      );
    }

    return true; // Return true if validation passes
  }

  static dDate(
    date: Date | string | number,
    // format = 'YYYY-MM-DD HH:mm:ss',
    format = 'DD-MM-YYYY',
  ): string {
    return moment(date).format(format);
  }

  static dateDiff(date: Date | string | number): number {
    return moment(date).diff(moment(), 'hours');
  }

  // static getHoursBetweenDateTime(
  //   startDateTime: string = new Date().toISOString(),
  //   endDateTime: string,
  // ): number {
  //   // Create Date objects for today with the given times
  //   const today = moment().format('YYYY-MM-DD');
  //   const endMoment = moment(`${today} ${endDateTime}`, 'YYYY-MM-DD HH:mm:ss');
  //   const outMoment = moment(
  //     `${today} ${startDateTime}`,
  //     'YYYY-MM-DD HH:mm:ss',
  //   );

  //   // Calculate the difference in hours (can be negative if checked out before office end)
  //   const diffHours = outMoment.diff(endMoment, 'hours', true);

  //   return diffHours;
  // }

  static getHoursBetweenDateTime(
    start: Date | string,
    end: Date | string,
  ): number {
    if (!start || !end) {
      throw new Error('Start and end dates are required');
    }

    const startDate = new Date(
      typeof start === 'string' ? start.trim() : start,
    );
    const endDate = new Date(typeof end === 'string' ? end.trim() : end);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error('Invalid date format');
    }

    const diffMs = endDate.getTime() - startDate.getTime();
    return diffMs / (1000 * 60 * 60);
  }

  static getHoursBetweenTime(start: string, end: string): number {
    if (!start || !end) {
      throw new Error('Start and end times are required');
    }

    // Normalize and split into hours/minutes
    const [startH, startM] = start.trim().split(':').map(Number);
    const [endH, endM] = end.trim().split(':').map(Number);

    if (isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM)) {
      throw new Error('Invalid time format, expected HH:mm');
    }

    // Convert to minutes
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    // If end is smaller, assume next day
    const diffMinutes =
      endMinutes >= startMinutes
        ? endMinutes - startMinutes
        : 24 * 60 - startMinutes + endMinutes;

    return diffMinutes / 60; // return in hours
  }

  static getMinutesBetweenDateTime(
    start: Date | string,
    end: Date | string,
  ): number {
    if (!start || !end) {
      throw new Error('Start and end values are required');
    }

    // Helper: detect if value is just "HH:mm"
    const isTimeOnly = (val: string) => /^\d{1,2}:\d{2}$/.test(val.trim());

    let startDate: Date;
    let endDate: Date;

    if (
      typeof start === 'string' &&
      isTimeOnly(start) &&
      typeof end === 'string' &&
      isTimeOnly(end)
    ) {
      // Handle time-only case
      const [startH, startM] = start.trim().split(':').map(Number);
      const [endH, endM] = end.trim().split(':').map(Number);

      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;

      const diffMinutes =
        endMinutes >= startMinutes
          ? endMinutes - startMinutes
          : 24 * 60 - startMinutes + endMinutes; // overnight case

      return diffMinutes;
    } else {
      // Handle full datetime
      startDate = new Date(typeof start === 'string' ? start.trim() : start);
      endDate = new Date(typeof end === 'string' ? end.trim() : end);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error('Invalid date/time format');
      }

      const diffMs = endDate.getTime() - startDate.getTime();
      return diffMs / (1000 * 60); // convert to minutes
    }
  }

  static minutesUntil(date: Date | string | number): number {
    return moment(date).diff(moment(), 'minutes');
  }

  static dDateUtc(
    date: Date | string | number,
    format = 'YYYY-MM-DD HH:mm:ss',
  ): string {
    return moment.utc(date).format(format);
  }

  static setTimeStringToUtcTime() {
    return moment.utc().format('HH:mm:ss');
  }

  static setTimeStringWithTimezone(timeString: string, timezone: string) {
    return moment.tz(timeString, 'HH:mm:ss', timezone).format('HH:mm:ss');
  }

  static compareTimesWithTimezone(
    checkInTime: Date,
    shiftTime: string,
    timezone: string = 'Asia/Dhaka',
  ): number {
    // Convert check-in time to the given timezone
    const checkInLocal = moment(checkInTime).tz(timezone).format('HH:mm:ss');

    // Compare as strings (works because HH:mm:ss format)
    if (checkInLocal < shiftTime) return -1; // Early/On time
    if (checkInLocal > shiftTime) return 1; // Late
    return 0; // Exactly on time
  }
  // For attendance check-in/check-out comparisons
  static getCurrentTimeInTimezone(timezone: string = 'UTC'): string {
    return moment().tz(timezone).format('HH:mm:ss');
  }

  static getCurrentDateInTimezone(timezone: string = 'UTC'): string {
    return moment().tz(timezone).format('YYYY-MM-DD');
  }

  // Convert time from one timezone to another (for shift times)
  static convertTimeToTimezone(
    timeString: string, // e.g., "09:00:00"
    fromTimezone: string, // e.g., "Asia/Dhaka"
    toTimezone: string, // e.g., "UTC"
  ): string {
    const today = moment().format('YYYY-MM-DD');
    const fullDateTime = `${today} ${timeString}`;

    return moment
      .tz(fullDateTime, fromTimezone)
      .tz(toTimezone)
      .format('HH:mm:ss');
  }

  static minutesUntilUtc(date: Date | string | number): number {
    return moment.utc(date).diff(moment.utc(), 'minutes');
  }

  static stringToTime(time: string): number {
    return moment.utc(time, 'HH:mm:ss').diff(moment.utc(), 'minutes');
  }

  static avatarText(value: string) {
    if (!value) return '';
    const matches = value.match(/\b(\w)/g);

    if (matches && matches.length == 1) {
      return value.substring(0, 2).toLocaleUpperCase();
    } else {
      const data = matches?.filter((item, index) => {
        if (index < 2) {
          return Object.assign({}, item);
        }
      });
      return data?.join('');
    }
  }

  static getLastDayOfMonth(y: number, m: number) {
    // Create a new Date object representing the last day of the specified month
    // By passing m + 1 as the month parameter and 0 as the day parameter, it represents the last day of the specified month
    if (!y && !m) return 0;
    return new Date(y, m + 1, 0).getDate();
  }
}
