import { test, expect, chromium } from '@playwright/test';
import { step, attachment } from 'allure-js-commons';
import { LoginPage } from '../pages/LoginPage';
import { RoomsPage } from '../pages/RoomsPage';
import { RoomDetailsPage } from '../pages/RoomDetailsPage';
const data = require('../fixtures/data.json');

let browser;
let context;
let page;
let roomsPage;
let roomDetailsPage;
let login;

test.describe('Room management tests in specific order', () => {
    test.beforeAll(async () => {
        browser = await chromium.launch();
        context = await browser.newContext();
        page = await context.newPage();
        roomsPage = new RoomsPage(page);
        roomDetailsPage = new RoomDetailsPage(page);
        login = new LoginPage(page);
        await login.gotoLoginPage();
        await login.login(data.adminCredentials.username, data.adminCredentials.password);
        await page.waitForTimeout(1000); 
        attachment('Home page', await page.screenshot(), {
            contentType: 'image/png'
        });
    });

    test.beforeEach(async () => {
        try {
            if (!context) {
                context = await browser.newContext();
            }
            if (!page || page.isClosed()) {
                page = await context.newPage();
            }
        } catch (error) {
            console.error('Error in beforeEach hook:', error);
            throw error;
        }
    }, 60000);

    test.afterAll(async () => {
        await roomsPage.logout();
        if (context) {
            await context.close();
        }
        if (browser) {
            await browser.close();
        }
    });

    test('Test data cleanup before executing the tests', async () => {
        for (const room of data.delete) {
            await roomsPage.testDataCleanup(room.roomNo);
            const roomExists = await roomsPage.isRoomNoVisible(room.roomNo);
            expect(roomExists, `Expected room ${room.roomNo} to be deleted.`).toBeFalsy();
        }
    });

    test('Admin Create Room', async () => {
        for (const room of data.create.valid) {
            await roomsPage.createRoom(room);
            await page.waitForTimeout(3000);
            const roomExists = await roomsPage.isRoomNoVisible(room.roomNo);
            expect(roomExists, `Expected room ${room.roomNo} to be created.`).toBeTruthy();
            attachment('screenshot', await page.screenshot(), {
                contentType: 'image/png'
            });
        }
    });

    test('Admin Update Room', async () => {
        for (const update of data.update) {
            const roomNumber = update.existingRoom.roomNo;
            await roomsPage.openRoomDetails(roomNumber);
            await roomDetailsPage.updateRoom(update.updatedData);
            await roomDetailsPage.gotoRoomsPage();
            const roomExists = await roomsPage.isRoomNoVisible(update.updatedData.roomNo);
            expect(roomExists, `Expected room ${update.updatedData.roomNo} to be updated.`).toBeTruthy();
            attachment(`Room ${update.updatedData.roomNo} details are updated successfully`, await page.screenshot(), {
                contentType: "image/png"});
        }
    });

    test('Admin Create Room - Field level validations', async () => {
        for (const room of data.create.invalid) {
            await roomsPage.createRoom(room);
            await page.waitForTimeout(3000);
            const message = room.error;
            const errorExists = await roomsPage.isErrorVisible(message);
            expect(errorExists, `Expected error message ${message} to be displayed.`).toBeTruthy();
            attachment(`Field level validation to verify the error message ${message} was successful`, await page.screenshot(), {
                contentType: "image/png"});
        }
    });

    const languages = ['en', 'de'];
    languages.forEach((lang) => {
        test(`Admin Update Room - Field level validation (${lang.toUpperCase()})`, async () => {
            roomsPage.setLanguage(lang);
            for (const update of data.updateinvalid) {
                const roomNumber = update.existingRoom.roomNo;
                await roomsPage.openRoomDetails(roomNumber);
                await roomDetailsPage.updateRoom(update.updatedData);
                await page.waitForTimeout(3000);
                const errorExists = await roomsPage.isErrorVisibleLocalization(update.updatedData);
                expect(errorExists, `Expected error message for room ${update.updatedData.roomNo} to be displayed.`).toBeTruthy();
                attachment(`Update room details - Field level validation error`, await page.screenshot(), {
                    contentType: "image/png"});
                await roomDetailsPage.gotoRoomsPage();
            }
        });
    });

    test('Admin Delete Room', async () => {
        for (const room of data.delete) {
            await roomsPage.deleteRoom(room.roomNo);
            const roomExists = await roomsPage.isRoomNoVisible(room.roomNo);
            expect(roomExists, `Expected room ${room.roomNo} to be deleted.`).toBeFalsy();
            attachment(`Room ${room.roomNo} deleted successfully`, await page.screenshot(), {
                contentType: "image/png"});
        }
    });

});
