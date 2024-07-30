const { log } = require("console");

exports.RoomsPage = 
class RoomsPage{
    constructor(page){
        this.page = page;
        this.language = "en";
        this.createbutton = '#createRoom';
        this.roomNoText = '#roomName';
        this.roomTypeList = '#type';
        this.accessibleList = '#accessible';
        this.facilities = {
            wifi: '#wifiCheckbox',
            tv: '#tvCheckbox',
          };
        this.priceText = '#roomPrice';
        this.roomList = '//div[@data-testid="roomlisting"]';
        this.deleteIcon = '.fa.fa-remove.roomDelete';
    }

    setLanguage(language) {
        this.language = language;
    }

    async createRoom(roomDetails){
        await this.page.fill(this.roomNoText, roomDetails.roomNo);
        await this.page.selectOption(this.roomTypeList, roomDetails.type);
        await this.page.selectOption(this.accessibleList, roomDetails.accessible);
        await this.page.fill(this.priceText, roomDetails.price);
        for (const facility of roomDetails.facilities) {
            await this.page.check(this.facilities[facility]);
        }
        await this.page.click(this.createbutton);
    }

    async deleteRoom(roomNo) {
        try {
            const roomElements = await this.page.locator(this.roomList).elementHandles();      
            for (const roomElement of roomElements) {
              const roomText = await roomElement.textContent();
              if (roomText.includes(roomNo)) {
                const deleteElement = await roomElement.$(this.deleteIcon);
                if (deleteElement) {
                    await deleteElement.click();
                    //await this.page.waitForSelector('text=${roomNo}', { state: 'hidden' });
                    await this.page.waitForTimeout(3000);
                    console.log('Clicked the Delete button for room:', roomNo);
                } else {
                    console.log('Delete button not found for room:', roomNo);
                }
                break;
              }
            }
        } catch (error) {
        console.error('Error selecting room :', error);
        throw error;
        }
    }

    async isRoomNoVisible(roomNo){
        await this.page.waitForSelector(this.roomList, { state: 'visible' });
        const roomExists = await this.page.getByText(roomNo).isVisible();
        return roomExists;
    }

    async isErrorVisible(errorText){
        const errorExists = await this.page.getByText(errorText).isVisible();
        return errorExists;
    }

    async isErrorVisibleLocalization(data){
        const errorText = data.languages[this.language].error;
        console.log("Message:", errorText)
        const errorExists = await this.page.getByText(errorText).isVisible();
        return errorExists;
    }

    async openRoomDetails(roomNo) {
        await this.page.getByText(roomNo).click();
    }

    async testDataCleanup(roomNo){
        const xpath = `//p[text()="${roomNo}"]`;
        const rooms = await this.page.$$(xpath); //more than one if duplicates are found
        console.log(`Data cleanup room ${roomNo} count:`, rooms.length);
        for(const room of rooms){
            await this.deleteRoom(roomNo);
            //await this.page.waitForSelector(this.roomList, { state: 'visible' });
        }
        
    }

    async logout(){
        await this.page.getByText('Logout').click();
    }
}