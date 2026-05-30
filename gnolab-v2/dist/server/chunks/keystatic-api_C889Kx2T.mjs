import { makeGenericAPIRouteHandler } from '@keystatic/core/api/generic';
import { parseString } from 'set-cookie-parser';
import { fields, config as config$1, collection } from '@keystatic/core';

function makeHandler(_config) {
  return async function keystaticAPIRoute(context) {
    var _context$locals, _ref, _config$clientId, _ref2, _config$clientSecret, _ref3, _config$secret;
    const envVarsForCf = (_context$locals = context.locals) === null || _context$locals === void 0 || (_context$locals = _context$locals.runtime) === null || _context$locals === void 0 ? void 0 : _context$locals.env;
    const handler = makeGenericAPIRouteHandler({
      ..._config,
      clientId: (_ref = (_config$clientId = _config.clientId) !== null && _config$clientId !== void 0 ? _config$clientId : envVarsForCf === null || envVarsForCf === void 0 ? void 0 : envVarsForCf.KEYSTATIC_GITHUB_CLIENT_ID) !== null && _ref !== void 0 ? _ref : tryOrUndefined(() => {
        return undefined                                          ;
      }),
      clientSecret: (_ref2 = (_config$clientSecret = _config.clientSecret) !== null && _config$clientSecret !== void 0 ? _config$clientSecret : envVarsForCf === null || envVarsForCf === void 0 ? void 0 : envVarsForCf.KEYSTATIC_GITHUB_CLIENT_SECRET) !== null && _ref2 !== void 0 ? _ref2 : tryOrUndefined(() => {
        return undefined                                              ;
      }),
      secret: (_ref3 = (_config$secret = _config.secret) !== null && _config$secret !== void 0 ? _config$secret : envVarsForCf === null || envVarsForCf === void 0 ? void 0 : envVarsForCf.KEYSTATIC_SECRET) !== null && _ref3 !== void 0 ? _ref3 : tryOrUndefined(() => {
        return undefined                                ;
      })
    }, {
      slugEnvName: "PUBLIC_KEYSTATIC_GITHUB_APP_SLUG"
    });
    const {
      body,
      headers,
      status
    } = await handler(context.request);
    let headersInADifferentStructure = /* @__PURE__ */ new Map();
    if (headers) {
      if (Array.isArray(headers)) {
        for (const [key, value] of headers) {
          if (!headersInADifferentStructure.has(key.toLowerCase())) {
            headersInADifferentStructure.set(key.toLowerCase(), []);
          }
          headersInADifferentStructure.get(key.toLowerCase()).push(value);
        }
      } else if (typeof headers.entries === "function") {
        for (const [key, value] of headers.entries()) {
          headersInADifferentStructure.set(key.toLowerCase(), [value]);
        }
        if ("getSetCookie" in headers && typeof headers.getSetCookie === "function") {
          const setCookieHeaders2 = headers.getSetCookie();
          if (setCookieHeaders2 !== null && setCookieHeaders2 !== void 0 && setCookieHeaders2.length) {
            headersInADifferentStructure.set("set-cookie", setCookieHeaders2);
          }
        }
      } else {
        for (const [key, value] of Object.entries(headers)) {
          headersInADifferentStructure.set(key.toLowerCase(), [value]);
        }
      }
    }
    const setCookieHeaders = headersInADifferentStructure.get("set-cookie");
    headersInADifferentStructure.delete("set-cookie");
    if (setCookieHeaders) {
      for (const setCookieValue of setCookieHeaders) {
        var _options$sameSite;
        const {
          name,
          value,
          ...options
        } = parseString(setCookieValue);
        const sameSite = (_options$sameSite = options.sameSite) === null || _options$sameSite === void 0 ? void 0 : _options$sameSite.toLowerCase();
        context.cookies.set(name, value, {
          domain: options.domain,
          expires: options.expires,
          httpOnly: options.httpOnly,
          maxAge: options.maxAge,
          path: options.path,
          sameSite: sameSite === "lax" || sameSite === "strict" || sameSite === "none" ? sameSite : void 0
        });
      }
    }
    return new Response(body, {
      status,
      headers: [...headersInADifferentStructure.entries()].flatMap(([key, val]) => val.map((x) => [key, x]))
    });
  };
}
function tryOrUndefined(fn) {
  try {
    return fn();
  } catch {
    return void 0;
  }
}

const livrable = fields.object({
  type: fields.select({
    label: "Type",
    options: [
      { label: "Code source (GitHub)", value: "github" },
      { label: "Document PDF", value: "pdf" },
      { label: "Diagramme BPMN", value: "bpmn" },
      { label: "Dashboard Power BI", value: "powerbi" },
      { label: "Présentation", value: "slides" },
      { label: "Démo live", value: "demo" },
      { label: "Document", value: "document" }
    ],
    defaultValue: "github"
  }),
  url: fields.url({ label: "URL" }),
  label: fields.text({ label: "Libellé" })
});
const config = config$1({
  storage: { kind: "local" },
  ui: {
    brand: { name: "GnoLab" }
  },
  collections: {
    projets: collection({
      label: "Projets",
      slugField: "titre",
      path: "src/content/projets/*",
      format: { contentField: "content" },
      schema: {
        titre: fields.slug({ name: { label: "Titre" } }),
        resume: fields.text({ label: "Résumé", multiline: true }),
        domaine: fields.select({
          label: "Domaine",
          options: [
            { label: "Ingénierie Systèmes", value: "Systèmes" },
            { label: "Data & ML", value: "Data-ML" },
            { label: "Business Analysis", value: "Business-Analysis" },
            { label: "Sécurité", value: "Sécurité" },
            { label: "Architecture", value: "Architecture" },
            { label: "Mathématiques", value: "Maths" }
          ],
          defaultValue: "Systèmes"
        }),
        type: fields.select({
          label: "Type",
          options: [
            { label: "Projet / repo", value: "repo" },
            { label: "Étude de cas", value: "etude-de-cas" },
            { label: "Dashboard", value: "dashboard" },
            { label: "Document", value: "document" },
            { label: "Analyse", value: "analyse" }
          ],
          defaultValue: "repo"
        }),
        track: fields.select({
          label: "Track (optionnel)",
          options: [
            { label: "—", value: "" },
            { label: "A — OS & Kernel", value: "A" },
            { label: "B — Data & MLOps", value: "B" },
            { label: "C — Architecture", value: "C" },
            { label: "D — Maths", value: "D" },
            { label: "E — Leadership", value: "E" },
            { label: "F — Sécurité", value: "F" }
          ],
          defaultValue: ""
        }),
        niveau: fields.text({ label: "Niveau" }),
        statut: fields.select({
          label: "Statut",
          options: [
            { label: "Planifié", value: "planifié" },
            { label: "En cours", value: "en-cours" },
            { label: "Terminé", value: "terminé" }
          ],
          defaultValue: "planifié"
        }),
        phase: fields.integer({ label: "Phase (1-3)" }),
        dateDebut: fields.date({ label: "Date de début" }),
        dateFin: fields.date({ label: "Date de fin (optionnel)" }),
        technos: fields.array(fields.text({ label: "Techno" }), {
          label: "Technos",
          itemLabel: (p) => p.value
        }),
        methodes: fields.array(fields.text({ label: "Méthode" }), {
          label: "Méthodes (BA)",
          itemLabel: (p) => p.value
        }),
        livrables: fields.array(livrable, {
          label: "Livrables",
          itemLabel: (p) => p.fields.label.value || p.fields.type.value
        }),
        featured: fields.checkbox({ label: "Mis en avant (accueil)" }),
        ordre: fields.integer({ label: "Ordre", defaultValue: 0 }),
        content: fields.markdoc({ label: "Contenu" })
      }
    }),
    articles: collection({
      label: "Articles",
      slugField: "titre",
      path: "src/content/articles/*",
      format: { contentField: "content" },
      schema: {
        titre: fields.slug({ name: { label: "Titre" } }),
        resume: fields.text({ label: "Résumé", multiline: true }),
        date: fields.date({ label: "Date" }),
        tags: fields.array(fields.text({ label: "Tag" }), {
          label: "Tags",
          itemLabel: (p) => p.value
        }),
        tempsLecture: fields.integer({ label: "Temps de lecture (min)", defaultValue: 5 }),
        projetLie: fields.text({ label: "Slug du projet lié (optionnel)" }),
        publie: fields.checkbox({ label: "Publié", defaultValue: true }),
        content: fields.markdoc({ label: "Contenu" })
      }
    }),
    certifications: collection({
      label: "Certifications",
      slugField: "nom",
      path: "src/content/certifications/*",
      format: { contentField: "content" },
      schema: {
        nom: fields.slug({ name: { label: "Nom" } }),
        organisme: fields.text({ label: "Organisme" }),
        domaine: fields.text({ label: "Domaine" }),
        credlyUrl: fields.url({ label: "Lien Credly" }),
        date: fields.date({ label: "Date" }),
        ordre: fields.integer({ label: "Ordre", defaultValue: 0 }),
        content: fields.markdoc({ label: "Description" })
      }
    })
  }
});

const all = makeHandler({ config });
const ALL = all;

const prerender = false;

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  ALL,
  all,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
