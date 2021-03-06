// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @plugin @not_cloud

import * as TIMEOUTS from '../../fixtures/timeouts';
import {demoPlugin, testPlugin} from '../../utils/plugins';

describe('collapse on 5 plugin buttons', () => {
    let testTeam;

    before(() => {
        cy.shouldNotRunOnCloudEdition();
        cy.shouldHavePluginUploadEnabled();

        // # Set plugin settings
        const newSettings = {
            PluginSettings: {
                Enable: true,
            },
        };
        cy.apiUpdateConfig(newSettings);

        // # Login as Admin
        cy.apiInitSetup().then(({team}) => {
            testTeam = team;
        });
        cy.apiAdminLogin();

        // # Uninstall all plugins
        cy.apiGetAllPlugins().then(({plugins}) => {
            const {active, inactive} = plugins;
            inactive.forEach((plugin) => cy.apiRemovePluginById(plugin.id));
            active.forEach((plugin) => cy.apiRemovePluginById(plugin.id));
        });
    });

    it('MM-T1649 Greater than 5 plugin buttons collapse to one icon in top nav', () => {
        // # Go to town square
        cy.visit(`/${testTeam.name}/channels/town-square`);

        // # Upload and enable test plugin with 5 channel header icons
        cy.apiUploadAndEnablePlugin(testPlugin).then(() => {
            cy.wait(TIMEOUTS.TWO_SEC);

            // # Get number of channel header icons
            cy.get('.channel-header__icon').its('length').then((icons) => {
                // # Upload and enable demo plugin with one additional channel header icon
                cy.apiUploadAndEnablePlugin(demoPlugin).then(() => {
                    cy.wait(TIMEOUTS.TWO_SEC);

                    // * Validate that channel header icons collapsed and number is reduced by 4
                    cy.get('.channel-header__icon').should('have.length', icons - 4);

                    // * Validate that plugin count is the same
                    cy.get('#pluginCount').should('have.text', icons - 4);
                });
            });
        });
    });
});
