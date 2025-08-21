// Static label pairing configuration for @spaced-out/eslint-plugin-i18n
// This file helps the plugin understand the relationship between static labels and their translations

// Export the expected structure for the plugin to work properly
const RENDER_ATTRS_BY_TAG = {}
const genesisPairings = {}
const RENDER_ATTRS = []

// CommonJS export for the ESLint plugin
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        RENDER_ATTRS_BY_TAG,
        genesisPairings,
        RENDER_ATTRS,
    }
}

// ES module export as fallback
export default {
    RENDER_ATTRS_BY_TAG,
    genesisPairings,
    RENDER_ATTRS,
}