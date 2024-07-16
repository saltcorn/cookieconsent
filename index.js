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
];

const buildConfigJS = async (context) => {
  const categories = {
    necessary: {
      readOnly: true,
    },
    analytics: {},
    marketing: {},
  };
  if (context.functionality_present)
    categories.functionality = { enabled: !!context.functionality_enabled };
  if (context.analytics_present)
    categories.analytics = { enabled: !!context.analytics_enabled };
  if (context.marketing_present)
    categories.marketing = { enabled: !!context.marketing_enabled };

  const guiOptions = {
    consentModal: {
      layout:
        context.consent_layout +
        (context.consent_layout_wide ? " wide" : " inline"),
      position:
        context.consent_layout === "bar"
          ? "bottom"
          : `${context.consent_posy} ${context.consent_posy}`,
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
  const opts = { categories, guiOptions };
  const content = `CookieConsent.run(${JSON.stringify(opts)})`;
  await fs.writeFile(
    join(__dirname, "public", "cookieconsent-config.js"),
    content
  );
};
const configuration_workflow = () =>
  new Workflow({
    onDone: async (context) => {
      await buildConfigJS(context);

      return {
        context,
      };
    },
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
                name: "consent_layout",
                label: "Layout",
                type: "String",
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
                attributes: { options: ["left", "center", "right"] },
                showIf: { consent_layout: ["box", "cloud"] },
              },
              {
                name: "consent_posy",
                label: "Position Y",
                type: "String",
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
                name: "pref_layout",
                label: "Layout",
                type: "String",
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
};
