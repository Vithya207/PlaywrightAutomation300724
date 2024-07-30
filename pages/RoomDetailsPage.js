exports.RoomDetailsPage = 
class RoomDetailsPage{
    constructor(page){
        this.page = page;
        this.editButton = 'button:has-text("Edit")';
        this.updatebutton = '#update';
        this.roomNoText = '#roomName';
        this.roomTypeList = '#type';
        this.accessible = '#accessible';
        this.facilities = {
            wifi: '#wifiCheckbox',
            tv: '#tvCheckbox',
            radio: '#radioCheckbox'
          };
        this.priceText = '#roomPrice';
        this.descriptionText = '#description';
        this.roomsLink = 'text=Rooms';
    }

    async updateRoom(roomDetails) {
        try {
          await this.page.waitForSelector(this.editButton, { state: 'visible' });
          await this.page.locator(this.editButton).click();
          await this.page.fill(this.roomNoText, roomDetails.roomNo);    
          await this.page.selectOption(this.roomTypeList, roomDetails.type);
          await this.page.selectOption(this.accessible, roomDetails.accessible);   
          await this.page.fill(this.priceText, '');
          await this.page.type(this.priceText, roomDetails.price.toString());
          
          for (const facility of roomDetails.facilities) {
            const facilityCheckbox = this.page.locator(this.facilities[facility]);
            const isChecked = await facilityCheckbox.isChecked();
            if (!isChecked) {
                await facilityCheckbox.click({ force: true });
            }
          }
          await this.page.fill(this.descriptionText, roomDetails.description);
          await this.page.locator(this.updatebutton).click();
          await this.page.waitForTimeout(4000);
        } catch (error) {
          console.error('Error editing room details:', error);
          throw error;
        }
      }

      async gotoRoomsPage(){
        await this.page.locator(this.roomsLink).click();
      }
}