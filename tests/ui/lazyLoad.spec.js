import { test, expect } from '../fixtures.js';
import * as allure from 'allure-js-commons';

test(
    'Go to Lazy Load page',
    {
        tag: '@lazyload',
        annotation: [
            { type: 'allure.label.feature', description: 'Lazy Load' },
            { type: 'allure.label.story', description: 'Go to Lazy Load' },
            { type: 'allure.label.severity', description: 'critical' },
        ],
    },
    async ({ lazyLoadPage }) => {
        await allure.step('Going to Lazy Load Page', () => lazyLoadPage.goto('/dynamic-catalog-lazy-load.html'));

        await expect(lazyLoadPage.title).toHaveText('Dynamic Catalog - Lazy Load');
    },



)