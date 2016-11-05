/**
 * Basic export template utilities.
 * This util handles basic export JSON structure
 * that isn't handled by the RedMUDLib itself.
 * 
 * @returns A template util lib-header.
 */
function templateUtil() {
    /**
     * Build the base output template.
     * 
     * @returns
     */
    function buildBaseOutputTemplate() {
        return {
            areas: {},
            rooms: {}
        };
    }

    return {
        templateUtil: {
            baseOutputTemplate: buildBaseOutputTemplate
        }
    }
}

module.exports = templateUtil();