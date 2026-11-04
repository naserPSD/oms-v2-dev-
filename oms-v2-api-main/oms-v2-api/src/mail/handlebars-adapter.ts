type HandlebarsAdapterCtor = new (...args: any[]) => {
  compile(mail: any, callback: any, mailerOptions: any): any;
};

const CANDIDATES = [
  '@nestjs-modules/mailer/adapters/handlebars.adapter',
  '@nestjs-modules/mailer/dist/adapters/handlebars.adapter',
];

function loadHandlebarsAdapter(): HandlebarsAdapterCtor {
  for (const name of CANDIDATES) {
    try {
      const loaded = require(name);
      if (loaded?.HandlebarsAdapter) {
        return loaded.HandlebarsAdapter;
      }
    } catch {
      // Newer mailer exports ./adapters/*, older builds only ship ./dist/adapters/*.
    }
  }
  throw new Error('HandlebarsAdapter could not be loaded from @nestjs-modules/mailer');
}

export const HandlebarsAdapter = loadHandlebarsAdapter();
