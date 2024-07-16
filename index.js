const Workflow = require("@saltcorn/data/models/workflow");
const Form = require("@saltcorn/data/models/form");

const fs = require("fs").promises;
const { join } = require("path");

const headers = () => [
  {
    script: `/plugins/public/cookieconsent@${
      require("./package.json").version
    }/cookieconsent.umd.js`,
  },
  {
    script: `/plugins/public/cookieconsent@${
      require("./package.json").version
    }/cookieconsent-config.js`,
  },
  {
    css: `/plugins/public/cookieconsent@${
      require("./package.json").version
    }/cookieconsent.css`,
  },
];

const buildConfigJS = async (context0) => {
  const context = context0 || {};
  const categories = {
    necessary: {
      readOnly: true,
    },
  };
  if (context.functionality_present)
    categories.functionality = { enabled: !!context.functionality_default };
  if (context.analytics_present)
    categories.analytics = { enabled: !!context.analytics_default };
  if (context.marketing_present)
    categories.marketing = { enabled: !!context.marketing_default };

  const guiOptions = {
    consentModal: {
      layout:
        context.consent_layout +
        (context.consent_layout_wide ? " wide" : " inline"),
      position:
        context.consent_layout === "bar"
          ? "bottom"
          : `${context.consent_posy} ${context.consent_posx}`,
      //equalWeightButtons: false,
      flipButtons: context.consent_flip_btns,
    },
    preferencesModal: {
      layout: context.pref_layout + (context.pref_layout_wide ? " wide" : ""),
      position: context.pref_posx,
      //equalWeightButtons: true,
      flipButtons: context.pref_flip_btns,
    },
  };
  const language = {
    default: "en",
    autoDetect: "browser",
    translations: {
      en: {
        consentModal: {
          title: context.consent_title,
          description: context.consent_description,
          acceptAllBtn: "Accept all",
          acceptNecessaryBtn: "Reject all",
          showPreferencesBtn: "Manage preferences",
          footer: context.consent_footer,
        },
        preferencesModal: {
          title: context.pref_title,
          acceptAllBtn: "Accept all",
          acceptNecessaryBtn: "Reject all",
          savePreferencesBtn: "Save preferences",
          closeIconLabel: "Close modal",
          serviceCounterLabel: "Service|Services",
          sections: [
            {
              description: context.pref_description,
            },
            {
              title: `${
                context.nec_title || "Strictly necessary cookies"
              } <span class="pm__badge">Always Enabled</span>`,
              description: context.nec_description || "Necessary cookies",
              linkedCategory: "necessary",
            },
            ...(context.functionality_present
              ? [
                  {
                    title: context.func_title || "Functionality cookies",
                    description:
                      context.func_description || "Functionality cookies",
                    linkedCategory: "functionality",
                  },
                ]
              : []),
            ...(context.analytics_present
              ? [
                  {
                    title: context.anal_title || "Analytics cookies",
                    description:
                      context.anal_description || "Analytics cookies",
                    linkedCategory: "analytics",
                  },
                ]
              : []),
            ...(context.marketing_present
              ? [
                  {
                    title: context.marketing_title || "Marketing cookies",
                    description:
                      context.marketing_description || "Marketing cookies",
                    linkedCategory: "marketing",
                  },
                ]
              : []),
          ],
        },
      },
    },
  };
  const opts = { categories, guiOptions, language };
  const content = `CookieConsent.run(${JSON.stringify(opts)})`;
  await fs.writeFile(
    join(__dirname, "public", "cookieconsent-config.js"),
    content
  );
};
const configuration_workflow = () =>
  new Workflow({
    onStepSuccess: async (step, ctx) => {
      await buildConfigJS(ctx);
    },
    onStepSave: async (step, ctx, formVals) => {
      await buildConfigJS(ctx);
    },
    steps: [
      {
        name: "Categories",
        form: async (ctx) => {
          return new Form({
            saveAndContinueOption: true,
            fields: [
              {
                input_type: "section_header",
                label: "Necessary cookies",
              },
              {
                name: "nec_title",
                label: "Title",
                type: "String",
                default: "Strictly necessary cookies",
              },
              {
                name: "nec_description",
                label: "Description",
                type: "String",
                fieldview: "textarea",
              },
              {
                input_type: "section_header",
                label: "Functionality cookies",
              },
              {
                name: "functionality_present",
                label: "Present",
                sublabel: "This section is presented to user",
                type: "Bool",
              },
              {
                name: "functionality_default",
                label: "Default",
                sublabel: "Enabled by default",
                type: "Bool",
                showIf: { functionality_present: true },
              },
              {
                name: "func_title",
                label: "Title",
                type: "String",
                default: "Functionality cookies",
                showIf: { functionality_present: true },
              },
              {
                name: "func_description",
                label: "Description",
                type: "String",
                fieldview: "textarea",
                showIf: { functionality_present: true },
              },
              {
                input_type: "section_header",
                label: "Analytics cookies",
              },
              {
                name: "analytics_present",
                label: "Present",
                sublabel: "This section is presented to user",
                type: "Bool",
              },
              {
                name: "analytics_default",
                label: "Default",
                sublabel: "Enabled by default",
                type: "Bool",
                showIf: { analytics_present: true },
              },
              {
                name: "anal_title",
                label: "Title",
                type: "String",
                default: "Analytics cookies",
                showIf: { analytics_present: true },
              },
              {
                name: "anal_description",
                label: "Description",
                type: "String",
                fieldview: "textarea",
                showIf: { analytics_present: true },
              },
              {
                input_type: "section_header",
                label: "Marketing cookies",
              },
              {
                name: "marketing_present",
                label: "Present",
                sublabel: "This section is presented to user",
                type: "Bool",
              },
              {
                name: "marketing_default",
                label: "Default",
                sublabel: "Enabled by default",
                type: "Bool",
                showIf: { marketing_present: true },
              },
              {
                name: "marketing_title",
                label: "Title",
                type: "String",
                default: "Marketing cookies",
                showIf: { marketing_present: true },
              },
              {
                name: "marketing_description",
                label: "Description",
                type: "String",
                fieldview: "textarea",
                showIf: { marketing_present: true },
              },
            ],
          });
        },
      },
      {
        name: "GUI options",
        form: async (ctx) => {
          return new Form({
            saveAndContinueOption: true,
            fields: [
              {
                input_type: "section_header",
                label: "Consent modal",
              },
              {
                name: "consent_title",
                label: "Title",
                type: "String",
                default: "Cookie consent",
              },
              {
                name: "consent_description",
                label: "Description",
                type: "String",
                fieldview: "textarea",
              },
              {
                name: "consent_footer",
                label: "Footer",
                type: "String",
                fieldview: "textarea",
              },
              {
                name: "consent_layout",
                label: "Layout",
                type: "String",
                required: true,
                attributes: { options: ["box", "cloud", "bar"] },
              },
              {
                name: "consent_layout_wide",
                label: "Wide",
                type: "Bool",
                showIf: { consent_layout: "box" },
              },
              {
                name: "consent_posx",
                label: "Position X",
                type: "String",
                required: true,
                attributes: { options: ["left", "center", "right"] },
                showIf: { consent_layout: ["box", "cloud"] },
              },
              {
                name: "consent_posy",
                label: "Position Y",
                type: "String",
                required: true,
                attributes: { options: ["top", "middle", "bottom"] },
                showIf: { consent_layout: ["box", "cloud"] },
              },
              {
                name: "consent_flip_btns",
                label: "Flip buttons",
                type: "Bool",
              },
              {
                input_type: "section_header",
                label: "Preferences modal",
              },
              {
                name: "pref_title",
                label: "Title",
                type: "String",
                default: "Cookie Preferences Center",
              },
              {
                name: "pref_description",
                label: "Description",
                type: "String",
                fieldview: "textarea",
              },
              {
                name: "pref_layout",
                label: "Layout",
                type: "String",
                required: true,
                attributes: { options: ["box", "bar"] },
              },
              {
                name: "pref_layout_wide",
                label: "Wide",
                type: "Bool",
                showIf: { pref_layout: "bar" },
              },
              {
                name: "pref_posx",
                label: "Position X",
                type: "String",
                required: true,
                attributes: { options: ["left", "right"] },
                showIf: { consent_layout: ["bar"] },
              },
              {
                name: "pref_flip_btns",
                label: "Flip buttons",
                type: "Bool",
              },
            ],
          });
        },
      },
    ],
  });

module.exports = {
  sc_plugin_api_version: 1,
  plugin_name: "cookieconsent",
  headers,
  configuration_workflow,
  onLoad: async (configuration) => {
    await buildConfigJS(configuration);
  },
};
