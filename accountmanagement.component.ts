import { Component, OnInit } from '@angular/core';
import { Pipe, PipeTransform } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { appService } from '../../app.service';
import {
    AccountManagementModel, AccountPaginationModel, DropDownModel, AccountListModel,
    TerminateAccount, AccountWidgetConfigModel, MohListInfoViewModel, MohListViewModel, VoiceMailViewModel, VoiceMailViewType,
    UpdateAccountModel
} from './accountmanagement.model';
import {
    ServiceFeatureViewModelList, ServiceFeaturesViewModel, ServiceAttributesViewModel, MohDropDown,
} from "./servicefeatures.model";
import { CallForwarding, FollowmeInfo, FollowmeNumber, UpdateForwardingNumber } from "./callforwarding.model";
import { TimeZoneModel } from '../../services/timezone/timezone.model';
import { CurrencyModel } from '../../services/currency/currency.model';
import { FilterPipe } from '../../pipes/filter.pipe';
import { Configuration } from '../../app.constants';
import { ConfirmDialogModule, ConfirmationService } from 'primeng/primeng';

declare var _userid: any;
declare var $: any
@Component({
    selector: 'product',
    templateUrl: `./accountmanagement.compnent.html`,
})
export class AccountManagementComponent implements OnInit {
    editSwitch: boolean;
    disablePaswUpdate: boolean;
    showPassword: boolean;
    loading: boolean;
    mohEnabled: boolean
    hideCli: boolean;
    showOtherCli: boolean;
    isCliActive: boolean;
    totalAccounts: number;
    tempConditionRules: string;
    tempConditionRulesDesc: string;
    initialValue: number;
    finalValue: number;
    addToExistingRuleHidden: boolean;
    forwardingGridLoader: boolean;
    showDomain: boolean;
    acconuntConfigApi: string;
    accountManagementApi: string;
    selectedMoh: string;
    otherCliNumber: string;
    statusFilter: any;
    selectedCli: string

    configSettings = new AccountWidgetConfigModel();
    AccountListModel = new AccountListModel();
    AccountPaginationModel = new AccountPaginationModel();
    ExtensionManagementList: Array<AccountManagementModel> = [];
    editAccountModel = new AccountManagementModel();
    terminateAccount = new TerminateAccount();
    TimeZones = new Array<TimeZoneModel>();
    CurrencyList = new Array<CurrencyModel>();
    extProductList = new Array<DropDownModel>();
    mohListInfoViewModel = new MohListInfoViewModel();
    serviceFeatureViewModelList = new ServiceFeatureViewModelList();
    mohDropDown = new MohDropDown();
    mohDropDownList = new Array<MohDropDown>();
    serviceFeaturesViewModel = new ServiceFeaturesViewModel();
    serviceAttributesViewModel = new ServiceAttributesViewModel();
    updateAccountModel = new UpdateAccountModel();
    cliDropDownList = new Array<DropDownModel>();
    callForawarding = new CallForwarding();
    followmeInfo = new FollowmeInfo();
    followmeNumberList = new Array<FollowmeNumber>();
    weekDays = new Array<DropDownModel>();
    months = new Array<DropDownModel>();
    dates = new Array<DropDownModel>();
    forwardingAccountList = new Array<AccountManagementModel>();
    forwardAddModel = new FollowmeNumber();
    voiceMailViewModel = new VoiceMailViewModel();
    voiceMailViewType = new VoiceMailViewType();
    
    constructor(private configuration: Configuration,
        private confirmationService: ConfirmationService, public service: appService) {
        this.acconuntConfigApi = `${configuration.Server}api/AccountWidgetConfig/`;
        this.accountManagementApi = `${configuration.Server}api/AccountManagement/`
        this.CurrencyList.push({ label: "Pund Sterling", value: "GBP" })
        this.AccountPaginationModel.i_customer = 27994;
        this.AccountPaginationModel.limit = 10;
        this.AccountPaginationModel.offset = 0;
        this.showPassword = false;
        this.disablePaswUpdate = false;
        this.mohEnabled = false;
        this.hideCli = false;
        this.showOtherCli = false;
        this.isCliActive = false;
        this.forwardingGridLoader = false;
        this.showDomain = false;
        this.setAddForwardingDefault();

        this.weekDays.push({ label: "Monday", value: "mo" })
        this.weekDays.push({ label: "Tuesday", value: "tu" })
        this.weekDays.push({ label: "Wednesday", value: "we" })
        this.weekDays.push({ label: "Thursday", value: "th" })
        this.weekDays.push({ label: "Friday", value: "fr" })
        this.weekDays.push({ label: "Saturday", value: "sa" })
        this.weekDays.push({ label: "Sunday", value: "su" })

        this.months.push({ label: "January", value: "1" })
        this.months.push({ label: "Feburary", value: "2" })
        this.months.push({ label: "March", value: "3" })
        this.months.push({ label: "April", value: "4" })
        this.months.push({ label: "May", value: "5" })
        this.months.push({ label: "Jane", value: "6" })
        this.months.push({ label: "July", value: "7" })
        this.months.push({ label: "August", value: "8" })
        this.months.push({ label: "September", value: "9" })
        this.months.push({ label: "October", value: "10" })
        this.months.push({ label: "November", value: "11" })
        this.months.push({ label: "December", value: "12" })

        //this.configuration.showMessage('Account', 'this is test message', 'success');

        for (let i = 0; i < 31; i++) {
            this.dates.push({ label: (i + 1).toString(), value: (i + 1).toString() })
        }

        this.clearTempConditionRules()

    }

    ngOnInit() {
        this.getAccountList();
        $('.scrollspy-example').scrollspy({ target: '.navbar' })
    }

    getAccountFeatures() {
        this.service.GetMultiple(this.accountManagementApi + "GetAccountFeatures", [{ "name": "i_account", "value": this.editAccountModel.i_account }],
            this.accountManagementApi + "GetVMSettings", [{ "name": "UserName", "value": this.editAccountModel.id }, { "name": "password", "value": this.editAccountModel.password }])
            .subscribe(
            data => { this.getAccountFeaturesSuccess(data[0]); this.getVMSettingsSuccess(data[1]) },
            error => this.getAccountErrorMessage(error),
            () => console.log('getData moh completed')
                )
     
    }

    getAccountErrorMessage(error) {
        this.configuration.showMessage('Account', error, 'error');
        this.loading = false;
    }

    private getAccountList() {

        this.loading = true;
        this.service
            .save(this.accountManagementApi + 'GetAccountList', this.AccountPaginationModel)
            .subscribe(
            data => this.successGetAccountList(data),
            error => this.configuration.showMessage('Account', error, 'error'),
            () => console.log('getData extensions completed'));
    }

    getAccountFeaturesSuccess(data) {
        
        $("#addAccount").show();
        $("#mainContent").hide();

        this.serviceFeatureViewModelList = data.serviceFeatureViewModelList;

        this.voiceMailViewType.VMMode = this.serviceFeatureViewModelList.service_features[0].attributes[1].values[0];

        if (this.serviceFeatureViewModelList.service_features[0].flag_value == "Y") {
            this.voiceMailViewType.VMFlag = true;
        }
        else {
            this.voiceMailViewType.VMFlag = false;
        }


        this.callForawarding = data.callForwarding;
        this.followmeInfo = this.callForawarding.followme_info;
        this.followmeNumberList = this.callForawarding.followme_numbers;
        this.followmeNumberList.forEach((item) => {
            if (item.domain != null && item.domain != "") {
                item.destination = item.redirect_number + "@" + item.domain;
            }
            else {
                item.destination = item.redirect_number;
            }
            if (item.active == "Y") {
                item.isActive = true;
            }
            else {
                item.isActive = false;
            }
        })
        this.mohEnabled = false;
        this.hideCli = false;
        this.showOtherCli = false;
        this.isCliActive = false;
        this.selectedCli = null;
        this.otherCliNumber = undefined;
        this.selectedMoh = undefined;
        var checkMOHFeature = this.serviceFeatureViewModelList.service_features.find(x => x.name == "music_on_hold")

        if (checkMOHFeature != null || checkMOHFeature != undefined) {
            if (checkMOHFeature.effective_flag_value == "Y") {
                this.mohEnabled = true;
                this.selectedMoh = checkMOHFeature.attributes[0].effective_values[0];
            }
        }
        var checkForCli = this.serviceFeatureViewModelList.service_features.find(x => x.name == "cli")
        if (checkForCli != null || checkForCli != undefined) {
            var number = checkForCli.attributes[0].effective_values[0];
            var checkIfExistingNumber = this.cliDropDownList.find(x => x.value == number);
            if (checkIfExistingNumber == null || checkIfExistingNumber == undefined) {
                this.showOtherCli = true;
                this.otherCliNumber = number;
                this.selectedCli = "other";
            }
            else {
                this.selectedCli = number;
            }
            if (checkForCli.effective_flag_value == "Y") {
                this.isCliActive = true;
            }


        }
        var checkForHiddenCli = this.serviceFeatureViewModelList.service_features.find(x => x.name == "clir")
        if (checkForHiddenCli) {
            if (checkForHiddenCli.effective_flag_value == "P") {
                this.hideCli = true;
            }

        }

    }

    successGetAccountList(data) {
        this.forwardingAccountList = data.CallForwardingList;
        this.AccountListModel = data;
        this.ExtensionManagementList = this.AccountListModel.account_list;
        this.totalAccounts = this.AccountListModel.total;
        this.configSettings = this.AccountListModel.accountWidgetConfig;
        if (this.configSettings.ShowSipPassword == true) {
            this.showPassword = true;
        }
        if (this.configSettings.DisablePasswordUpdate == true) {
            this.disablePaswUpdate = true;
        }
        //
        this.mohDropDownList = [];
        this.mohListInfoViewModel = this.AccountListModel.mohListInfoViewModel;
        this.mohListInfoViewModel.default_moh_list.forEach((item) => {
            this.mohDropDown = new DropDownModel();
            this.mohDropDown.label = item.name;
            this.mohDropDown.value = item.i_moh.toString();
            this.mohDropDownList.push(this.mohDropDown);
        })
        this.cliDropDownList = this.AccountListModel.CliList;
        this.cliDropDownList.splice(0, 0, { value: null, label: "Choose" })
        this.cliDropDownList.push({ value: "other", label: "Other" });
        this.extProductList = this.AccountListModel.productList;
        this.loading = false;

    }

    filterData(dt, field, match) {

        let value = this.statusFilter
        if (value) {
            dt.filter(1, field, match)
        }
        else {
            dt.filter(0, field, match)
        }



    }

    editAccountModal(account) {
        
        this.editAccountModel = account;
        if (this.editAccountModel.blocked == "N") {
            this.editSwitch = false;
        }
        else {
            this.editSwitch = true;
        }
        this.getAccountFeatures();
    }

    getVMSetting() {

        this.service
            .Get(this.accountManagementApi + "GetVMSettings", [{ "name": "UserName", "value": this.editAccountModel.id }, { "name": "password", "value": this.editAccountModel.password }])
            .subscribe(
            data => this.getVMSettingsSuccess(data),
            error => this.getAccountErrorMessage(error),
            () => console.log('getData moh completed')
        );
    }
    getVMSettingsSuccess(data) {
        
        this.voiceMailViewModel = data;

       
    }

    setVmSettings() {
        
        this.voiceMailViewModel.username = this.editAccountModel.id;
        this.voiceMailViewModel.ui_password = this.editAccountModel.password;

        this.service
            .save(this.accountManagementApi + "SetVMSettings", this.voiceMailViewModel)
            .subscribe(
            data => {  },
            error => this.getAccountErrorMessage(error),
            () => console.log('SaveData moh completed')
        );
    }

    closeEditModel() {
        $("#addAccount").hide()
        $("#mainContent").show()
    }

    handleChange(e) {

        this.editSwitch = e.checked;
    }

    toogleMoh(e) {
        this.mohEnabled = e.checked;
    }

    submitAccount() {
        
        if (parseInt(this.editAccountModel.extension_id) > this.configSettings.MaximumRange || parseInt(this.editAccountModel.extension_id) < this.configSettings.MinimumRange) {
            var message = "Extension number must be less than " + this.configSettings.MaximumRange + " or greater than " + this.configSettings.MinimumRange;
            this.configuration.showMessage('Account', message, 'error');
            return
        }

        if (this.editAccountModel.extension_id && this.editAccountModel.extension_id.length != 0 && this.editAccountModel.extension_id.length != this.configSettings.ExtNumberLength) {
            var message = "Extension number length should be " + this.configSettings.ExtNumberLength ;
            this.configuration.showMessage('Account', message, 'error');
            return
        }

        if (this.editSwitch) {
            this.editAccountModel.blocked = "Y"
        }
        else {
            this.editAccountModel.blocked = "N"
        }

        this.serviceFeatureViewModelList.i_account = this.editAccountModel.i_account;


        let mohService = this.serviceFeatureViewModelList.service_features.find(x => x.name == "music_on_hold");
        mohService.locked = this.mohEnabled ? "0" : "1";
        if (this.mohEnabled) {
            mohService.attributes[0].effective_values[0] = this.selectedMoh;
        }
        mohService.effective_flag_value = this.mohEnabled ? "Y" : "N";
        mohService.flag_value = this.mohEnabled ? "Y" : "N";



        let hideCLIService = this.serviceFeatureViewModelList.service_features.find(x => x.name == "clir");
        hideCLIService.locked = "0";
        hideCLIService.effective_flag_value = this.hideCli ? "P" : "N";
        hideCLIService.flag_value = this.hideCli ? "~" : "N";



        let clivalue = this.selectedCli == "other" ? this.otherCliNumber : this.selectedCli;

        //clivalue = this.hideCli ? "" : clivalue;

        let cliService = this.serviceFeatureViewModelList.service_features.find(x => x.name == "cli");

        cliService.locked = "0";
        cliService.effective_flag_value = "Y"; //this.hideCli ? "N" : "Y"; 
        cliService.flag_value = "Y"; //this.hideCli ? "N" : "Y"; 

        cliService.attributes[0].effective_values[0] = clivalue;
        cliService.attributes[0].values[0] = clivalue;
        cliService.attributes[0].name = "centrex";

        cliService.attributes[1].effective_values[0] = clivalue;
        cliService.attributes[1].values[0] = clivalue;
        cliService.attributes[1].name = "display_number";

        cliService.attributes[2].effective_values[0] = "D";
        cliService.attributes[2].values[0] = "D";
        cliService.attributes[2].name = "display_number_check";

        cliService.attributes[3].effective_values[0] = clivalue;
        cliService.attributes[3].values[0] = clivalue;
        cliService.attributes[3].name = "display_name";

        cliService.attributes[4].effective_values[0] = "Y";
        cliService.attributes[4].values[0] = "Y";
        cliService.attributes[4].name = "display_name_override";

        cliService.attributes[5].effective_values[0] = "N";
        cliService.attributes[5].values[0] = "N";
        cliService.attributes[5].name = "account_group";


        this.updateAccountModel.accountModel = this.editAccountModel;
        this.updateAccountModel.serviceFeatureViewModelList = this.serviceFeatureViewModelList;
        this.updateAccountModel.updateFollowMeInfo = {
            i_account: this.followmeInfo.i_account,
            followme_info: this.followmeInfo
        }

        this.serviceFeatureViewModelList.service_features[0].attributes[1].values[0] = this.voiceMailViewType.VMMode;
        if (this.voiceMailViewType.VMFlag == true) {
            this.serviceFeatureViewModelList.service_features[0].flag_value = "Y"
        }
        else {
            this.serviceFeatureViewModelList.service_features[0].flag_value = "N"
        }
        //this.setVmSettings();

        this.voiceMailViewModel.username = this.editAccountModel.id;
        this.voiceMailViewModel.ui_password = this.editAccountModel.password;

        $("#updateButtonLoader").removeClass('hidden');
        
        this.service.saveMultiple(this.accountManagementApi + "UpdateAccount", this.updateAccountModel,
            this.accountManagementApi + "SetVMSettings", this.voiceMailViewModel)
            .subscribe(
            data => {  this.addAccountSuccesMethod(data[0]); this.getVMSettingsSuccess(data[1]) },
            error => this.addAccountErrorMethod(error),
            () => { $("#updateButtonLoader").addClass('hidden'); });
    }

    addAccountErrorMethod(error) {
        this.configuration.showMessage('Account', error, 'error')
        $("#updateButtonLoader").addClass('hidden');
    }

    addAccountSuccesMethod(data) {
        this.loading = true;
        $("#addAccount").hide();
        $("#mainContent").show()
        this.getAccountList();
    }

    updateFeatureSettings() {
        this.service.save(this.accountManagementApi + "updateServiceFeatures", this.serviceFeatureViewModelList).subscribe(
            data => this.sucessUpdateServiceFeatures(data),
            error => {
                this.configuration.showMessage('Account', "Request failed due to your internet connection. Please try again.", 'error');
                $("#updateButtonLoader").addClass('hidden');
            },
            () => { }
        )

    }

    sucessUpdateServiceFeatures(data) {
        this.configuration.showMessage('Account', "Successfully updated.", 'success');
        this.getAccountList();
        $("#addAccount").hide();
        $("#mainContent").show()
    }

    termiateAccount(i_account) {
        this.confirmationService.confirm({
            message: 'Are you sure that you want to remove?',
            header: 'Confirmation',
            icon: 'fa fa-question-circle',
            accept: () => {
                this.terminateAccount.IAccount = i_account;
                this.service.save(this.accountManagementApi + "TerminateAccount", this.terminateAccount)
                    .subscribe(
                    data => this.terminateAccountSuccesMethod(data),
                    error => this.configuration.showMessage('Account', error, 'error'),
                    () => console.log('getData extensions completed'));
            },
            reject: () => {

            }
        });
    }

    terminateAccountSuccesMethod(data) {

        this.configuration.showMessage('Account', "Account terminated.", 'error')
    }

    showPasswordMethod() {
        if ($("#h323_password").attr('type') == "text") {
            $("#h323_password").attr('type', "password")
        }
        else {
            $("#h323_password").attr('type', "text")
        }
    }

    updateForwardingNumberDetails() {
        //
        this.forwardingGridLoader = true;
        let updateForwardingNumber = new UpdateForwardingNumber();
        updateForwardingNumber.i_follow_me_number = this.forwardAddModel.i_follow_me_number;
        updateForwardingNumber.number_info = this.forwardAddModel;
        updateForwardingNumber.number_info.redirect_number = updateForwardingNumber.number_info.selectedForwardAccountId;
        updateForwardingNumber.number_info.destination = updateForwardingNumber.number_info.selectedForwardAccountId;
        updateForwardingNumber.number_info.i_account = this.editAccountModel.i_account;
        if (updateForwardingNumber.number_info.isActive) {
            updateForwardingNumber.number_info.active = "Y";
        }
        else {
            updateForwardingNumber.number_info.active = "N";
        }
        let obj = new Object();
        let test = this.serviceFeatureViewModelList.service_features.find(x => x.name == "forward_mode").effective_flag_value;
        if (this.serviceFeatureViewModelList.service_features.find(x => x.name == "forward_mode").effective_flag_value != "F") {
            this.serviceFeatureViewModelList.service_features.find(x => x.name == "forward_mode").effective_flag_value = "F"
            this.serviceFeatureViewModelList.service_features.find(x => x.name == "forward_mode").flag_value = "F"

            obj = {
                service_features: this.serviceFeatureViewModelList,
                updateForwardingNumberModel: updateForwardingNumber
            }
        }
        else {
            obj = {
                service_features: null,
                updateForwardingNumberModel: updateForwardingNumber
            }
        }

        this.service.save(this.accountManagementApi + "UpdateFollowMeNumber", obj).subscribe(
            data => this.updateForwardingNumberDetailsSuccess(data),
            error => {
                this.configuration.showMessage('Account', error, "error")
            },
            () => {
                console.log("Done");
                this.forwardingGridLoader = false;
            }
        )
    }

    updateForwardingNumberDetailsSuccess(data) {

        $('#addForwardingNumber').modal("hide");
        this.followmeNumberList = data;
        this.followmeNumberList.forEach((item) => {
            //
            if (item.domain != null && item.domain != "") {
                item.destination = item.redirect_number + "@" + item.domain;
            }
            else {
                item.destination = item.redirect_number;
            }
            if (item.active == "Y") {
                item.isActive = true;
            }
            else {
                item.isActive = false;
            }
        });
        this.showDomain = false;

        this.clearTempConditionRules();
        this.setAddForwardingDefault();
        this.configuration.showMessage('Account', "Forwading saved", "success")
    }

    forwardChangeEvent(e) {

        //
        let iAccount: string;
        iAccount = this.forwardAddModel.selectedForwardAccoutIAccount;
        if (iAccount != "-1" && iAccount != "-2" && iAccount != "-3") {
            var test = $("#selectFrowardingOption").text();
            var value = $("#selectFrowardingOption").val()
            var trueVal = value.split(':');
            this.forwardAddModel.selectedForwardAccountId = trueVal[1].trim();
            var checkAccount = this.AccountListModel.account_list.find(x => x.id == this.forwardAddModel.selectedForwardAccountId)
            if (checkAccount != undefined)
            {
                this.forwardAddModel.selectedForwardAccountName = this.AccountListModel.account_list.find(x => x.id == this.forwardAddModel.selectedForwardAccountId).extension_name;
            }
            else
            {
                var checkHunt = this.AccountListModel.HuntGroupList.find(x => x.id == this.forwardAddModel.selectedForwardAccountId)
                this.forwardAddModel.selectedForwardAccountName = checkHunt.name;
            }
            this.forwardAddModel.name = this.forwardAddModel.selectedForwardAccountName;
            this.forwardAddModel.redirect_number = this.forwardAddModel.selectedForwardAccountId;
            this.showDomain = false;
        }
        else {
            if (iAccount == "-1") {
                this.forwardAddModel.name = "Mobile";
                this.showDomain = false;
            }
            if (iAccount == "-2") {
                this.forwardAddModel.name = "SIP-URI";
                this.showDomain = true;
            }
            if (iAccount == "-3") {
                this.forwardAddModel.name = "Landline";
                this.showDomain = false;
            }
            this.forwardAddModel.redirect_number = "";
        }
    }

    cliChangeEvent(e) {

        if (this.selectedCli == "other") {
            this.showOtherCli = true;
        }
        else {
            this.showOtherCli = false;
        }
    }

    addForwardingNumberEvent() {
        this.initializeTimePicker();
        this.clearTempConditionRules();
        this.setAddForwardingDefault();
        this.forwardAddModel.selectedMonths = [];
        this.forwardAddModel.selectedDays = [];
        this.forwardAddModel.selectedDates = [];

        $("#addForwardingNumber").modal("show");
    }

    closeAddForwardingNumberModel() {
        this.setAddForwardingDefault();
        this.clearTempConditionRules();
        $('#addForwardingNumber').modal("hide");
    }

    addCondition() {
        this.forwardAddModel.fromTime = $("#fromTimeVal").val();
        this.forwardAddModel.toTime = $("#toTimeVal").val();
        let fromArray = this.forwardAddModel.fromTime.split(':');
        let toArray = this.forwardAddModel.toTime.split(':');
        let fromHourInt: number = parseInt(fromArray[0]);
        let fromMinInt: number = parseInt(fromArray[1]);
        let toHourInt: number = parseInt(toArray[0]);
        let toMinInt: number = parseInt(toArray[1]);
        let checkIfSameHour: boolean = false;
        if (toHourInt < fromHourInt) {
            this.configuration.showMessage("Account", "To time must be less than from time", "error");
            return;
        }
        else if (toHourInt == fromHourInt && toMinInt < fromMinInt) {
            this.configuration.showMessage("Account", "To time must be less than from time", "error");
            return;
        }
        else if (toHourInt == fromHourInt && toMinInt > fromMinInt) {
            checkIfSameHour = true;
        }
        let months: string = "";
        let dates: string = "";
        let days: string = "";
        this.forwardAddModel.selectedDates.forEach((item) => {
            dates = dates + item + " ";
        })
        this.forwardAddModel.selectedDays.forEach((item) => {
            days = days + item + " ";
        })
        this.forwardAddModel.selectedMonths.forEach((item) => {
            months = months + item + " ";
        })
        if (this.forwardAddModel.selectedDates.length <= 0 && this.forwardAddModel.selectedDays.length <= 0 && this.forwardAddModel.selectedMonths.length <= 0) {

            if (this.forwardAddModel.fromTime == "00:00" && this.forwardAddModel.toTime == "23:59") {
                this.forwardAddModel.period = "Always";

            }
            else {
                if (checkIfSameHour) {
                    this.forwardAddModel.period = "hr{" + fromArray[0] + "}min{" + (toMinInt - fromMinInt) + "}"
                    this.forwardAddModel.period_description = this.forwardAddModel.period;
                    return;
                }
                else if (fromArray[1] == "00" && toArray[1] == "00") {
                    this.forwardAddModel.period = "hr{" + fromArray[0] + "-" + toArray[0] + "}"
                }
                else if (fromArray[1] != "00" && toArray[1] == "00") {
                    this.forwardAddModel.period = "hr{" + fromArray[0] + "}min{" + fromArray[1] + "-59}," +
                        "hr{" + (fromHourInt + 1) + "-" + (toHourInt - 1) + "}," +
                        "hr{" + toArray[0] + "}"
                }
                else if (fromArray[1] == "00" && toArray[1] != "00") {
                    this.forwardAddModel.period = "hr{" + fromArray[0] + "}," +
                        "hr{" + (fromHourInt + 1) + "-" + (toHourInt - 1) + "}," +
                        "hr{" + toArray[0] + "}min{0-" + toArray[1] + "}"
                }
                else if (fromArray[1] != "00" && toArray[1] != "00") {
                    this.forwardAddModel.period = "hr{" + fromArray[0] + "}min{" + fromArray[1] + "-59}," +
                        "hr{" + (fromHourInt + 1) + "-" + (toHourInt - 1) + "}," +
                        "hr{" + toArray[0] + "}min{0-" + toArray[1] + "}"
                }
            }
        }
        else if (this.forwardAddModel.selectedDates.length > 0 && this.forwardAddModel.selectedDays.length <= 0 && this.forwardAddModel.selectedMonths.length <= 0) {

            if (checkIfSameHour) {
                this.forwardAddModel.period = "hr{" + fromArray[0] + "}min{" + (toMinInt - fromMinInt) + "}md{" + dates + " } ";
                this.forwardAddModel.period_description = this.forwardAddModel.period;
                return;
            }
            if (fromArray[1] == "00" && toArray[1] == "00") {
                this.forwardAddModel.period = "hr{" + fromArray[0] + "-" + toArray[0] + "}md{" + dates + "}";
            }
            else if (fromArray[1] != "00" && toArray[1] == "00") {
                this.forwardAddModel.period = "hr{" + fromArray[0] + "}min{" + fromArray[1] + "-59}md{" + dates + "}," +
                    "hr{" + (fromHourInt + 1) + "-" + (toHourInt - 1) + "}md{" + dates + "}," +
                    "hr{" + toArray[0] + "}md{" + dates + "}"
            }
            else if (fromArray[1] == "00" && toArray[1] != "00") {
                this.forwardAddModel.period = "hr{" + fromArray[0] + "}md{" + dates + "}," +
                    "hr{" + (fromHourInt + 1) + "-" + (toHourInt - 1) + "}md{" + dates + "}," +
                    "hr{" + toArray[0] + "}min{0-" + toArray[1] + "}md{" + dates + "}"
            }
            else if (fromArray[1] != "00" && toArray[1] != "00") {
                this.forwardAddModel.period = "hr{" + fromArray[0] + "}min{" + fromArray[1] + "-59}md{" + dates + "}," +
                    "hr{" + (fromHourInt + 1) + "-" + (toHourInt - 1) + "}md{" + dates + "}," +
                    "hr{" + toArray[0] + "}min{0-" + toArray[1] + "}md{" + dates + "}"
            }
        }
        else if (this.forwardAddModel.selectedDates.length > 0 && this.forwardAddModel.selectedDays.length > 0 && this.forwardAddModel.selectedMonths.length <= 0) {
            if (checkIfSameHour) {
                this.forwardAddModel.period = "hr{" + fromArray[0] + "}min{" + (toMinInt - fromMinInt) + "}wd{" + days + "}md{" + dates + "}";
                this.forwardAddModel.period_description = this.forwardAddModel.period;
                return;
            }
            if (fromArray[1] == "00" && toArray[1] == "00") {
                this.forwardAddModel.period = "hr{" + fromArray[0] + "-" + toArray[0] + "}wd{" + days + "}md{" + dates + "}";
            }
            else if (fromArray[1] != "00" && toArray[1] == "00") {
                this.forwardAddModel.period = "hr{" + fromArray[0] + "}min{" + fromArray[1] + "-59}wd{" + days + "}md{" + dates + "}," +
                    "hr{" + (fromHourInt + 1) + "-" + (toHourInt - 1) + "}wd{" + days + "}md{" + dates + "}," +
                    "hr{" + toArray[0] + "}wd{" + days + "}md{" + dates + "}"
            }
            else if (fromArray[1] == "00" && toArray[1] != "00") {
                this.forwardAddModel.period = "hr{" + fromArray[0] + "}wd{" + days + "}md{" + dates + "}," +
                    "hr{" + (fromHourInt + 1) + "-" + (toHourInt - 1) + "}wd{" + days + "}md{" + dates + "}," +
                    "hr{" + toArray[0] + "}min{0-" + toArray[1] + "}wd{" + days + "}md{" + dates + "}"
            }
            else if (fromArray[1] != "00" && toArray[1] != "00") {
                this.forwardAddModel.period = "hr{" + fromArray[0] + "}min{" + fromArray[1] + "-59}wd{" + days + "}md{" + dates + "}," +
                    "hr{" + (fromHourInt + 1) + "-" + (toHourInt - 1) + "}wd{" + days + "}md{" + dates + "}," +
                    "hr{" + toArray[0] + "}min{0-" + toArray[1] + "}wd{" + days + "}md{" + dates + "}"
            }
        }
        else if (this.forwardAddModel.selectedDates.length > 0 && this.forwardAddModel.selectedDays.length <= 0 && this.forwardAddModel.selectedMonths.length > 0) {
            if (checkIfSameHour) {
                this.forwardAddModel.period = "hr{" + fromArray[0] + "}min{" + (toMinInt - fromMinInt) + "}md{" + dates + "}mo{" + months + "}";
                this.forwardAddModel.period_description = this.forwardAddModel.period;
                return;
            }
            if (fromArray[1] == "00" && toArray[1] == "00") {
                this.forwardAddModel.period = "hr{" + fromArray[0] + "-" + toArray[0] + "}md{" + dates + "}mo{" + months + "}";
            }
            else if (fromArray[1] != "00" && toArray[1] == "00") {
                this.forwardAddModel.period = "hr{" + fromArray[0] + "}min{" + fromArray[1] + "-59}}md{" + dates + "}mo{" + months + "}," +
                    "hr{" + (fromHourInt + 1) + "-" + (toHourInt - 1) + "}}md{" + dates + "}mo{" + months + "}," +
                    "hr{" + toArray[0] + "}}md{" + dates + "}mo{" + months + "}"
            }
            else if (fromArray[1] == "00" && toArray[1] != "00") {
                this.forwardAddModel.period = "hr{" + fromArray[0] + "}}md{" + dates + "}mo{" + months + "}," +
                    "hr{" + (fromHourInt + 1) + "-" + (toHourInt - 1) + "}}md{" + dates + "}mo{" + months + "}," +
                    "hr{" + toArray[0] + "}min{0-" + toArray[1] + "}}md{" + dates + "}mo{" + months + "}"
            }
            else if (fromArray[1] != "00" && toArray[1] != "00") {
                this.forwardAddModel.period = "hr{" + fromArray[0] + "}min{" + fromArray[1] + "-59}}md{" + dates + "}mo{" + months + "}," +
                    "hr{" + (fromHourInt + 1) + "-" + (toHourInt - 1) + "}}md{" + dates + "}mo{" + months + "}," +
                    "hr{" + toArray[0] + "}min{0-" + toArray[1] + "}}md{" + dates + "}mo{" + months + "}"
            }
        }
        else if (this.forwardAddModel.selectedDates.length <= 0 && this.forwardAddModel.selectedDays.length > 0 && this.forwardAddModel.selectedMonths.length <= 0) {
            if (checkIfSameHour) {
                this.forwardAddModel.period = "hr{" + fromArray[0] + "}min{" + (toMinInt - fromMinInt) + "}wd{" + days + "}";
                this.forwardAddModel.period_description = this.forwardAddModel.period;
                return;
            }
            if (fromArray[1] == "00" && toArray[1] == "00") {
                this.forwardAddModel.period = "hr{" + fromArray[0] + "-" + toArray[0] + "}wd{" + days + "}";
            }
            else if (fromArray[1] != "00" && toArray[1] == "00") {
                this.forwardAddModel.period = "hr{" + fromArray[0] + "}min{" + fromArray[1] + "-59}wd{" + days + "}," +
                    "hr{" + (fromHourInt + 1) + "-" + (toHourInt - 1) + "}wd{" + days + "}," +
                    "hr{" + toArray[0] + "}wd{" + days + "}"
            }
            else if (fromArray[1] == "00" && toArray[1] != "00") {
                this.forwardAddModel.period = "hr{" + fromArray[0] + "}wd{" + days + "}," +
                    "hr{" + (fromHourInt + 1) + "-" + (toHourInt - 1) + "}wd{" + days + "}," +
                    "hr{" + toArray[0] + "}min{0-" + toArray[1] + "}wd{" + days + "}"
            }
            else if (fromArray[1] != "00" && toArray[1] != "00") {
                this.forwardAddModel.period = "hr{" + fromArray[0] + "}min{" + fromArray[1] + "-59}wd{" + days + "}," +
                    "hr{" + (fromHourInt + 1) + "-" + (toHourInt - 1) + "}wd{" + days + "}," +
                    "hr{" + toArray[0] + "}min{0-" + toArray[1] + "}wd{" + days + "}"
            }
        }
        else if (this.forwardAddModel.selectedDates.length <= 0 && this.forwardAddModel.selectedDays.length > 0 && this.forwardAddModel.selectedMonths.length > 0) {
            if (checkIfSameHour) {
                this.forwardAddModel.period = "hr{" + fromArray[0] + "}min{" + (toMinInt - fromMinInt) + "}wd{" + days + "}mo{" + months + "}";
                this.forwardAddModel.period_description = this.forwardAddModel.period;
                return;
            }
            if (fromArray[1] == "00" && toArray[1] == "00") {
                this.forwardAddModel.period = "hr{" + fromArray[0] + "-" + toArray[0] + "}wd{" + days + "}mo{" + months + "}";
            }
            else if (fromArray[1] != "00" && toArray[1] == "00") {
                this.forwardAddModel.period = "hr{" + fromArray[0] + "}min{" + fromArray[1] + "-59}wd{" + days + "}mo{" + months + "}," +
                    "hr{" + (fromHourInt + 1) + "-" + (toHourInt - 1) + "}wd{" + days + "}mo{" + months + "}," +
                    "hr{" + toArray[0] + "}wd{" + days + "}mo{" + months + "}"
            }
            else if (fromArray[1] == "00" && toArray[1] != "00") {
                this.forwardAddModel.period = "hr{" + fromArray[0] + "}wd{" + days + "}mo{" + months + "}," +
                    "hr{" + (fromHourInt + 1) + "-" + (toHourInt - 1) + "}wd{" + days + "}mo{" + months + "}," +
                    "hr{" + toArray[0] + "}min{0-" + toArray[1] + "}wd{" + days + "}mo{" + months + "}"
            }
            else if (fromArray[1] != "00" && toArray[1] != "00") {
                this.forwardAddModel.period = "hr{" + fromArray[0] + "}min{" + fromArray[1] + "-59}wd{" + days + "}mo{" + months + "}," +
                    "hr{" + (fromHourInt + 1) + "-" + (toHourInt - 1) + "}wd{" + days + "}mo{" + months + "}," +
                    "hr{" + toArray[0] + "}min{0-" + toArray[1] + "}wd{" + days + "}mo{" + months + "}"
            }
        }
        else if (this.forwardAddModel.selectedDates.length <= 0 && this.forwardAddModel.selectedDays.length <= 0 && this.forwardAddModel.selectedMonths.length > 0) {
            if (checkIfSameHour) {
                this.forwardAddModel.period = "hr{" + fromArray[0] + "}min{" + (toMinInt - fromMinInt) + "}mo{" + months + "}";
                this.forwardAddModel.period_description = this.forwardAddModel.period;
                return;
            }
            if (fromArray[1] == "00" && toArray[1] == "00") {
                this.forwardAddModel.period = "hr{" + fromArray[0] + "-" + toArray[0] + "}mo{" + months + "}";
            }
            else if (fromArray[1] != "00" && toArray[1] == "00") {
                this.forwardAddModel.period = "hr{" + fromArray[0] + "}min{" + fromArray[1] + "-59}mo{" + months + "}," +
                    "hr{" + (fromHourInt + 1) + "-" + (toHourInt - 1) + "}mo{" + months + "}," +
                    "hr{" + toArray[0] + "}mo{" + months + "}"
            }
            else if (fromArray[1] == "00" && toArray[1] != "00") {
                this.forwardAddModel.period = "hr{" + fromArray[0] + "}mo{" + months + "}," +
                    "hr{" + (fromHourInt + 1) + "-" + (toHourInt - 1) + "}mo{" + months + "}," +
                    "hr{" + toArray[0] + "}min{0-" + toArray[1] + "}mo{" + months + "}"
            }
            else if (fromArray[1] != "00" && toArray[1] != "00") {
                this.forwardAddModel.period = "hr{" + fromArray[0] + "}min{" + fromArray[1] + "-59}mo{" + months + "}," +
                    "hr{" + (fromHourInt + 1) + "-" + (toHourInt - 1) + "}mo{" + months + "}," +
                    "hr{" + toArray[0] + "}min{0-" + toArray[1] + "}mo{" + months + "}"
            }
        }
        else if (this.forwardAddModel.selectedDates.length > 0 && this.forwardAddModel.selectedDays.length > 0 && this.forwardAddModel.selectedMonths.length > 0) {
            if (checkIfSameHour) {
                this.forwardAddModel.period = "hr{" + fromArray[0] + "}min{" + (toMinInt - fromMinInt) + "}wd{" + days + "}md{" + dates + "}mo{" + months + "}";
                this.forwardAddModel.period_description = this.forwardAddModel.period;
                return;
            }
            if (fromArray[1] == "00" && toArray[1] == "00") {
                this.forwardAddModel.period = "hr{" + fromArray[0] + "-" + toArray[0] + "}wd{" + days + "}md{" + dates + "}mo{" + months + "}";
            }
            else if (fromArray[1] != "00" && toArray[1] == "00") {
                this.forwardAddModel.period = "hr{" + fromArray[0] + "}min{" + fromArray[1] + "-59}wd{" + days + "}md{" + dates + "}mo{" + months + "}," +
                    "hr{" + (fromHourInt + 1) + "-" + (toHourInt - 1) + "}wd{" + days + "}md{" + dates + "}mo{" + months + "}," +
                    "hr{" + toArray[0] + "}wd{" + days + "}md{" + dates + "}mo{" + months + "}"
            }
            else if (fromArray[1] == "00" && toArray[1] != "00") {
                this.forwardAddModel.period = "hr{" + fromArray[0] + "}wd{" + days + "}md{" + dates + "}mo{" + months + "}," +
                    "hr{" + (fromHourInt + 1) + "-" + (toHourInt - 1) + "}wd{" + days + "}md{" + dates + "}mo{" + months + "}," +
                    "hr{" + toArray[0] + "}min{0-" + toArray[1] + "}wd{" + days + "}md{" + dates + "}mo{" + months + "}"
            }
            else if (fromArray[1] != "00" && toArray[1] != "00") {
                this.forwardAddModel.period = "hr{" + fromArray[0] + "}min{" + fromArray[1] + "-59}wd{" + days + "}md{" + dates + "}mo{" + months + "}," +
                    "hr{" + (fromHourInt + 1) + "-" + (toHourInt - 1) + "}wd{" + days + "}md{" + dates + "}mo{" + months + "}," +
                    "hr{" + toArray[0] + "}min{0-" + toArray[1] + "}wd{" + days + "}md{" + dates + "}mo{" + months + "}"
            }
        }
        this.forwardAddModel.period_description = this.forwardAddModel.period;
    }

    addToExistingCondition() {
        this.forwardAddModel.fromTime = $("#fromTimeVal").val();
        this.forwardAddModel.toTime = $("#toTimeVal").val();
        let fromArray = this.forwardAddModel.fromTime.split(':');
        let toArray = this.forwardAddModel.toTime.split(':');
        let fromHourInt: number = parseInt(fromArray[0]);
        let fromMinInt: number = parseInt(fromArray[1]);
        let toHourInt: number = parseInt(toArray[0]);
        let toMinInt: number = parseInt(toArray[1]);
        let checkIfSameHour: boolean = false;
        if (toHourInt < fromHourInt) {
            this.configuration.showMessage("Account", "To time must be less than from time", "error");
            return;
        }
        else if (toHourInt == fromHourInt && toMinInt < fromMinInt) {
            this.configuration.showMessage("Account", "To time must be less than from time", "error");
            return;
        }
        else if (toHourInt == fromHourInt && toMinInt > fromMinInt) {
            checkIfSameHour = true;
        }
        let months: string = "";
        let dates: string = "";
        let days: string = "";
        this.forwardAddModel.selectedDates.forEach((item) => {
            dates = dates + item + " ";
        })
        this.forwardAddModel.selectedDays.forEach((item) => {
            days = days + item + " ";
        })
        this.forwardAddModel.selectedMonths.forEach((item) => {
            months = months + item + " ";
        })
        if (this.forwardAddModel.selectedDates.length <= 0 && this.forwardAddModel.selectedDays.length <= 0 && this.forwardAddModel.selectedMonths.length <= 0) {

            if (this.forwardAddModel.fromTime == "00:00" && this.forwardAddModel.toTime == "23:59") {
                this.forwardAddModel.period = "Always";

            }
            else {
                if (checkIfSameHour) {
                    this.forwardAddModel.period = this.forwardAddModel.period + "," + "hr{" + fromArray[0] + "}min{" + (toMinInt - fromMinInt) + "}"
                    this.forwardAddModel.period_description = this.forwardAddModel.period;
                    return;
                }
                else if (fromArray[1] == "00" && toArray[1] == "00") {
                    this.forwardAddModel.period = this.forwardAddModel.period + "," + "hr{" + fromArray[0] + "-" + toArray[0] + "}"
                }
                else if (fromArray[1] != "00" && toArray[1] == "00") {
                    this.forwardAddModel.period = this.forwardAddModel.period + "," + "hr{" + fromArray[0] + "}min{" + fromArray[1] + "-59}," +
                        "hr{" + (fromHourInt + 1) + "-" + (toHourInt - 1) + "}," +
                        "hr{" + toArray[0] + "}"
                }
                else if (fromArray[1] == "00" && toArray[1] != "00") {
                    this.forwardAddModel.period = this.forwardAddModel.period + "," + "hr{" + fromArray[0] + "}," +
                        "hr{" + (fromHourInt + 1) + "-" + (toHourInt - 1) + "}," +
                        "hr{" + toArray[0] + "}min{0-" + toArray[1] + "}"
                }
                else if (fromArray[1] != "00" && toArray[1] != "00") {
                    this.forwardAddModel.period = this.forwardAddModel.period + "," + "hr{" + fromArray[0] + "}min{" + fromArray[1] + "-59}," +
                        "hr{" + (fromHourInt + 1) + "-" + (toHourInt - 1) + "}," +
                        "hr{" + toArray[0] + "}min{0-" + toArray[1] + "}"
                }
            }
        }
        else if (this.forwardAddModel.selectedDates.length > 0 && this.forwardAddModel.selectedDays.length <= 0 && this.forwardAddModel.selectedMonths.length <= 0) {

            if (checkIfSameHour) {
                this.forwardAddModel.period = this.forwardAddModel.period + "," + "hr{" + fromArray[0] + "}min{" + (toMinInt - fromMinInt) + "}md{" + dates + " } ";
                this.forwardAddModel.period_description = this.forwardAddModel.period;
                return;
            }
            if (fromArray[1] == "00" && toArray[1] == "00") {
                this.forwardAddModel.period = this.forwardAddModel.period + "," + "hr{" + fromArray[0] + "-" + toArray[0] + "}md{" + dates + "}";
            }
            else if (fromArray[1] != "00" && toArray[1] == "00") {
                this.forwardAddModel.period = this.forwardAddModel.period + "," + "hr{" + fromArray[0] + "}min{" + fromArray[1] + "-59}md{" + dates + "}," +
                    "hr{" + (fromHourInt + 1) + "-" + (toHourInt - 1) + "}md{" + dates + "}," +
                    "hr{" + toArray[0] + "}md{" + dates + "}"
            }
            else if (fromArray[1] == "00" && toArray[1] != "00") {
                this.forwardAddModel.period = this.forwardAddModel.period + "," + "hr{" + fromArray[0] + "}md{" + dates + "}," +
                    "hr{" + (fromHourInt + 1) + "-" + (toHourInt - 1) + "}md{" + dates + "}," +
                    "hr{" + toArray[0] + "}min{0-" + toArray[1] + "}md{" + dates + "}"
            }
            else if (fromArray[1] != "00" && toArray[1] != "00") {
                this.forwardAddModel.period = this.forwardAddModel.period + "," + "hr{" + fromArray[0] + "}min{" + fromArray[1] + "-59}md{" + dates + "}," +
                    "hr{" + (fromHourInt + 1) + "-" + (toHourInt - 1) + "}md{" + dates + "}," +
                    "hr{" + toArray[0] + "}min{0-" + toArray[1] + "}md{" + dates + "}"
            }
        }
        else if (this.forwardAddModel.selectedDates.length > 0 && this.forwardAddModel.selectedDays.length > 0 && this.forwardAddModel.selectedMonths.length <= 0) {
            if (checkIfSameHour) {
                this.forwardAddModel.period = this.forwardAddModel.period + "," + "hr{" + fromArray[0] + "}min{" + (toMinInt - fromMinInt) + "}wd{" + days + "}md{" + dates + "}";
                this.forwardAddModel.period_description = this.forwardAddModel.period;
                return;
            }
            if (fromArray[1] == "00" && toArray[1] == "00") {
                this.forwardAddModel.period = this.forwardAddModel.period + "," + "hr{" + fromArray[0] + "-" + toArray[0] + "}wd{" + days + "}md{" + dates + "}";
            }
            else if (fromArray[1] != "00" && toArray[1] == "00") {
                this.forwardAddModel.period = this.forwardAddModel.period + "," + "hr{" + fromArray[0] + "}min{" + fromArray[1] + "-59}wd{" + days + "}md{" + dates + "}," +
                    "hr{" + (fromHourInt + 1) + "-" + (toHourInt - 1) + "}wd{" + days + "}md{" + dates + "}," +
                    "hr{" + toArray[0] + "}wd{" + days + "}md{" + dates + "}"
            }
            else if (fromArray[1] == "00" && toArray[1] != "00") {
                this.forwardAddModel.period = this.forwardAddModel.period + "," + "hr{" + fromArray[0] + "}wd{" + days + "}md{" + dates + "}," +
                    "hr{" + (fromHourInt + 1) + "-" + (toHourInt - 1) + "}wd{" + days + "}md{" + dates + "}," +
                    "hr{" + toArray[0] + "}min{0-" + toArray[1] + "}wd{" + days + "}md{" + dates + "}"
            }
            else if (fromArray[1] != "00" && toArray[1] != "00") {
                this.forwardAddModel.period = this.forwardAddModel.period + "," + "hr{" + fromArray[0] + "}min{" + fromArray[1] + "-59}wd{" + days + "}md{" + dates + "}," +
                    "hr{" + (fromHourInt + 1) + "-" + (toHourInt - 1) + "}wd{" + days + "}md{" + dates + "}," +
                    "hr{" + toArray[0] + "}min{0-" + toArray[1] + "}wd{" + days + "}md{" + dates + "}"
            }
        }
        else if (this.forwardAddModel.selectedDates.length > 0 && this.forwardAddModel.selectedDays.length <= 0 && this.forwardAddModel.selectedMonths.length > 0) {
            if (checkIfSameHour) {
                this.forwardAddModel.period = this.forwardAddModel.period + "," + "hr{" + fromArray[0] + "}min{" + (toMinInt - fromMinInt) + "}md{" + dates + "}mo{" + months + "}";
                this.forwardAddModel.period_description = this.forwardAddModel.period;
                return;
            }
            if (fromArray[1] == "00" && toArray[1] == "00") {
                this.forwardAddModel.period = this.forwardAddModel.period + "," + "hr{" + fromArray[0] + "-" + toArray[0] + "}md{" + dates + "}mo{" + months + "}";
            }
            else if (fromArray[1] != "00" && toArray[1] == "00") {
                this.forwardAddModel.period = this.forwardAddModel.period + "," + "hr{" + fromArray[0] + "}min{" + fromArray[1] + "-59}}md{" + dates + "}mo{" + months + "}," +
                    "hr{" + (fromHourInt + 1) + "-" + (toHourInt - 1) + "}}md{" + dates + "}mo{" + months + "}," +
                    "hr{" + toArray[0] + "}}md{" + dates + "}mo{" + months + "}"
            }
            else if (fromArray[1] == "00" && toArray[1] != "00") {
                this.forwardAddModel.period = this.forwardAddModel.period + "," + "hr{" + fromArray[0] + "}}md{" + dates + "}mo{" + months + "}," +
                    "hr{" + (fromHourInt + 1) + "-" + (toHourInt - 1) + "}}md{" + dates + "}mo{" + months + "}," +
                    "hr{" + toArray[0] + "}min{0-" + toArray[1] + "}}md{" + dates + "}mo{" + months + "}"
            }
            else if (fromArray[1] != "00" && toArray[1] != "00") {
                this.forwardAddModel.period = this.forwardAddModel.period + "," + "hr{" + fromArray[0] + "}min{" + fromArray[1] + "-59}}md{" + dates + "}mo{" + months + "}," +
                    "hr{" + (fromHourInt + 1) + "-" + (toHourInt - 1) + "}}md{" + dates + "}mo{" + months + "}," +
                    "hr{" + toArray[0] + "}min{0-" + toArray[1] + "}}md{" + dates + "}mo{" + months + "}"
            }
        }
        else if (this.forwardAddModel.selectedDates.length <= 0 && this.forwardAddModel.selectedDays.length > 0 && this.forwardAddModel.selectedMonths.length <= 0) {
            if (checkIfSameHour) {
                this.forwardAddModel.period = this.forwardAddModel.period + "," + "hr{" + fromArray[0] + "}min{" + (toMinInt - fromMinInt) + "}wd{" + days + "}";
                this.forwardAddModel.period_description = this.forwardAddModel.period;
                return;
            }
            if (fromArray[1] == "00" && toArray[1] == "00") {
                this.forwardAddModel.period = this.forwardAddModel.period + "," + "hr{" + fromArray[0] + "-" + toArray[0] + "}wd{" + days + "}";
            }
            else if (fromArray[1] != "00" && toArray[1] == "00") {
                this.forwardAddModel.period = this.forwardAddModel.period + "," + "hr{" + fromArray[0] + "}min{" + fromArray[1] + "-59}wd{" + days + "}," +
                    "hr{" + (fromHourInt + 1) + "-" + (toHourInt - 1) + "}wd{" + days + "}," +
                    "hr{" + toArray[0] + "}wd{" + days + "}"
            }
            else if (fromArray[1] == "00" && toArray[1] != "00") {
                this.forwardAddModel.period = this.forwardAddModel.period + "," + "hr{" + fromArray[0] + "}wd{" + days + "}," +
                    "hr{" + (fromHourInt + 1) + "-" + (toHourInt - 1) + "}wd{" + days + "}," +
                    "hr{" + toArray[0] + "}min{0-" + toArray[1] + "}wd{" + days + "}"
            }
            else if (fromArray[1] != "00" && toArray[1] != "00") {
                this.forwardAddModel.period = this.forwardAddModel.period + "," + "hr{" + fromArray[0] + "}min{" + fromArray[1] + "-59}wd{" + days + "}," +
                    "hr{" + (fromHourInt + 1) + "-" + (toHourInt - 1) + "}wd{" + days + "}," +
                    "hr{" + toArray[0] + "}min{0-" + toArray[1] + "}wd{" + days + "}"
            }
        }
        else if (this.forwardAddModel.selectedDates.length <= 0 && this.forwardAddModel.selectedDays.length > 0 && this.forwardAddModel.selectedMonths.length > 0) {
            if (checkIfSameHour) {
                this.forwardAddModel.period = this.forwardAddModel.period + "," + "hr{" + fromArray[0] + "}min{" + (toMinInt - fromMinInt) + "}wd{" + days + "}mo{" + months + "}";
                this.forwardAddModel.period_description = this.forwardAddModel.period;
                return;
            }
            if (fromArray[1] == "00" && toArray[1] == "00") {
                this.forwardAddModel.period = this.forwardAddModel.period + "," + "hr{" + fromArray[0] + "-" + toArray[0] + "}wd{" + days + "}mo{" + months + "}";
            }
            else if (fromArray[1] != "00" && toArray[1] == "00") {
                this.forwardAddModel.period = this.forwardAddModel.period + "," + "hr{" + fromArray[0] + "}min{" + fromArray[1] + "-59}wd{" + days + "}mo{" + months + "}," +
                    "hr{" + (fromHourInt + 1) + "-" + (toHourInt - 1) + "}wd{" + days + "}mo{" + months + "}," +
                    "hr{" + toArray[0] + "}wd{" + days + "}mo{" + months + "}"
            }
            else if (fromArray[1] == "00" && toArray[1] != "00") {
                this.forwardAddModel.period = this.forwardAddModel.period + "," + "hr{" + fromArray[0] + "}wd{" + days + "}mo{" + months + "}," +
                    "hr{" + (fromHourInt + 1) + "-" + (toHourInt - 1) + "}wd{" + days + "}mo{" + months + "}," +
                    "hr{" + toArray[0] + "}min{0-" + toArray[1] + "}wd{" + days + "}mo{" + months + "}"
            }
            else if (fromArray[1] != "00" && toArray[1] != "00") {
                this.forwardAddModel.period = this.forwardAddModel.period + "," + "hr{" + fromArray[0] + "}min{" + fromArray[1] + "-59}wd{" + days + "}mo{" + months + "}," +
                    "hr{" + (fromHourInt + 1) + "-" + (toHourInt - 1) + "}wd{" + days + "}mo{" + months + "}," +
                    "hr{" + toArray[0] + "}min{0-" + toArray[1] + "}wd{" + days + "}mo{" + months + "}"
            }
        }
        else if (this.forwardAddModel.selectedDates.length <= 0 && this.forwardAddModel.selectedDays.length <= 0 && this.forwardAddModel.selectedMonths.length > 0) {
            if (checkIfSameHour) {
                this.forwardAddModel.period = this.forwardAddModel.period + "," + "hr{" + fromArray[0] + "}min{" + (toMinInt - fromMinInt) + "}mo{" + months + "}";
                this.forwardAddModel.period_description = this.forwardAddModel.period;
                return;
            }
            if (fromArray[1] == "00" && toArray[1] == "00") {
                this.forwardAddModel.period = this.forwardAddModel.period + "," + "hr{" + fromArray[0] + "-" + toArray[0] + "}mo{" + months + "}";
            }
            else if (fromArray[1] != "00" && toArray[1] == "00") {
                this.forwardAddModel.period = this.forwardAddModel.period + "," + "hr{" + fromArray[0] + "}min{" + fromArray[1] + "-59}mo{" + months + "}," +
                    "hr{" + (fromHourInt + 1) + "-" + (toHourInt - 1) + "}mo{" + months + "}," +
                    "hr{" + toArray[0] + "}mo{" + months + "}"
            }
            else if (fromArray[1] == "00" && toArray[1] != "00") {
                this.forwardAddModel.period = this.forwardAddModel.period + "," + "hr{" + fromArray[0] + "}mo{" + months + "}," +
                    "hr{" + (fromHourInt + 1) + "-" + (toHourInt - 1) + "}mo{" + months + "}," +
                    "hr{" + toArray[0] + "}min{0-" + toArray[1] + "}mo{" + months + "}"
            }
            else if (fromArray[1] != "00" && toArray[1] != "00") {
                this.forwardAddModel.period = this.forwardAddModel.period + "," + "hr{" + fromArray[0] + "}min{" + fromArray[1] + "-59}mo{" + months + "}," +
                    "hr{" + (fromHourInt + 1) + "-" + (toHourInt - 1) + "}mo{" + months + "}," +
                    "hr{" + toArray[0] + "}min{0-" + toArray[1] + "}mo{" + months + "}"
            }
        }
        else if (this.forwardAddModel.selectedDates.length > 0 && this.forwardAddModel.selectedDays.length > 0 && this.forwardAddModel.selectedMonths.length > 0) {
            if (checkIfSameHour) {
                this.forwardAddModel.period = this.forwardAddModel.period + "," + "hr{" + fromArray[0] + "}min{" + (toMinInt - fromMinInt) + "}wd{" + days + "}md{" + dates + "}mo{" + months + "}";
                this.forwardAddModel.period_description = this.forwardAddModel.period;
                return;
            }
            if (fromArray[1] == "00" && toArray[1] == "00") {
                this.forwardAddModel.period = this.forwardAddModel.period + "," + "hr{" + fromArray[0] + "-" + toArray[0] + "}wd{" + days + "}md{" + dates + "}mo{" + months + "}";
            }
            else if (fromArray[1] != "00" && toArray[1] == "00") {
                this.forwardAddModel.period = this.forwardAddModel.period + "," + "hr{" + fromArray[0] + "}min{" + fromArray[1] + "-59}wd{" + days + "}md{" + dates + "}mo{" + months + "}," +
                    "hr{" + (fromHourInt + 1) + "-" + (toHourInt - 1) + "}wd{" + days + "}md{" + dates + "}mo{" + months + "}," +
                    "hr{" + toArray[0] + "}wd{" + days + "}md{" + dates + "}mo{" + months + "}"
            }
            else if (fromArray[1] == "00" && toArray[1] != "00") {
                this.forwardAddModel.period = this.forwardAddModel.period + "," + "hr{" + fromArray[0] + "}wd{" + days + "}md{" + dates + "}mo{" + months + "}," +
                    "hr{" + (fromHourInt + 1) + "-" + (toHourInt - 1) + "}wd{" + days + "}md{" + dates + "}mo{" + months + "}," +
                    "hr{" + toArray[0] + "}min{0-" + toArray[1] + "}wd{" + days + "}md{" + dates + "}mo{" + months + "}"
            }
            else if (fromArray[1] != "00" && toArray[1] != "00") {
                this.forwardAddModel.period = this.forwardAddModel.period + "," + "hr{" + fromArray[0] + "}min{" + fromArray[1] + "-59}wd{" + days + "}md{" + dates + "}mo{" + months + "}," +
                    "hr{" + (fromHourInt + 1) + "-" + (toHourInt - 1) + "}wd{" + days + "}md{" + dates + "}mo{" + months + "}," +
                    "hr{" + toArray[0] + "}min{0-" + toArray[1] + "}wd{" + days + "}md{" + dates + "}mo{" + months + "}"
            }
        }
        this.forwardAddModel.period_description = this.forwardAddModel.period;
    }

    editForwardingNumber(forward) {
        this.clearTempConditionRules();
        this.setAddForwardingDefault();
        //
        this.forwardAddModel = forward;


        //this.forwardAddModel.conditionRuleDescription = forward.period_description;
        //this.forwardAddModel.conditionRules = forward.period;
        this.forwardAddModel.fromTime = "00:00";
        this.forwardAddModel.toTime = "23:59";
        this.forwardAddModel.isActive = forward.isActive;
        this.forwardAddModel.selectedMonths = [];
        this.forwardAddModel.selectedDays = [];
        this.forwardAddModel.selectedDates = [];
        if (forward.name != "SIP-URI" && forward.name != "Mobile" && forward.name != "Landline") {
            if (this.forwardingAccountList.find(x => x.id == forward.destination) != undefined)
                {
                this.forwardAddModel.selectedForwardAccoutIAccount = this.forwardingAccountList.find(x => x.id == forward.destination).id;
            this.forwardAddModel.selectedForwardAccountId = forward.destination;
            }
            else if (this.AccountListModel.HuntGroupList.find(x => x.id == forward.destination) != undefined)
            {
                //
                this.forwardAddModel.selectedForwardAccoutIAccount = this.AccountListModel.HuntGroupList.find(x => x.id == forward.destination).id;
                this.forwardAddModel.selectedForwardAccountName = this.AccountListModel.HuntGroupList.find(x => x.id == forward.destination).name;
                this.forwardAddModel.selectedForwardAccountId = this.AccountListModel.HuntGroupList.find(x => x.id == forward.destination).id;
            }
            else
            {
                //
                console.log(forward);
                this.forwardAddModel.selectedForwardAccoutIAccount = forward.name;
                this.forwardAddModel.selectedForwardAccountId = forward.destination;
            }
            this.showDomain = false;
            this.forwardAddModel.domain = "";
        }
        else {
            if (forward.name == "SIP-URI") {
                this.forwardAddModel.selectedForwardAccoutIAccount = "-2";
                let destination = forward.destination.split('@');
                this.forwardAddModel.selectedForwardAccountId = destination[0];
                this.showDomain = true;
            }
            if (forward.name == "Mobile") {
                this.forwardAddModel.selectedForwardAccoutIAccount = "-1";
                this.forwardAddModel.selectedForwardAccountId = forward.destination;
                this.showDomain = false;
                this.forwardAddModel.domain = "";
            }
            if (forward.name == "Landline") {
               
                this.forwardAddModel.selectedForwardAccoutIAccount = "-3";
                this.forwardAddModel.selectedForwardAccountId = forward.destination;
                this.showDomain = false;
                this.forwardAddModel.domain = "";
            }
        }

        if (this.forwardAddModel.period != "Always") {
            this.addToExistingRuleHidden = true;
        }
        $("#addForwardingNumber").modal("show");
        this.initializeTimePicker();

    }

    deleteForwardingNumber(forward) {
        this.forwardingGridLoader = true;
        this.service.Get(this.accountManagementApi + "DeleteForwardingNumber?i_follow_me_number=" + forward.i_follow_me_number + "&i_account=" + forward.i_account, null)
            .subscribe(
            data => this.deleteForwardingNumberSuccess(data),
            error => { this.configuration.showMessage('Account', error, "error") },
            () => { this.forwardingGridLoader = false; }
            )
    }

    deleteForwardingNumberSuccess(data) {

        this.configuration.showMessage('Account', "Deleted forwarding nuumber", "success")
        this.followmeNumberList = data;
        this.followmeNumberList.forEach((item) => {
            if (item.domain != null && item.domain != "") {
                item.destination = item.redirect_number + "@" + item.domain;
            }
            else {
                item.destination = item.redirect_number;
            }
            if (item.active == "Y") {
                item.isActive = true;
            }
            else {
                item.isActive = false;
            }
        })
    }

    initializeTimePicker() {
        $('#fromTime').datetimepicker({
            format: 'HH:mm'
        });
        $("#toTime").datetimepicker({
            format: 'HH:mm'
        });
    }

    setAddForwardingDefault() {
        if (this.followmeInfo.timeout != undefined || this.followmeInfo.timeout != null) {
            this.forwardAddModel.timeout = this.followmeInfo.timeout;
        }
        else {
            this.forwardAddModel.timeout = 15;
        }
        this.forwardAddModel.isActive = true;
        this.forwardAddModel.fromTime = "00:00";
        this.forwardAddModel.toTime = "23:59";
        this.forwardAddModel.period = "Always";
        this.forwardAddModel.period_description = "Always";
        this.forwardAddModel.selectedForwardAccountId = null;
        this.forwardAddModel.selectedForwardAccountName = null;
        this.forwardAddModel.selectedForwardAccoutIAccount = null;
        this.forwardAddModel.selectedMonths = [];
        this.forwardAddModel.selectedDays = [];
        this.forwardAddModel.selectedDates = [];
        this.tempConditionRules = "";
        this.tempConditionRulesDesc = "";
        this.forwardAddModel.i_follow_me_number = 0;
        this.forwardAddModel.i_follow_order = 0;
        this.forwardAddModel.redirect_number = "";
        this.forwardAddModel.i_follow_me = 0;
        this.forwardAddModel.domain = null;
        this.showDomain = false;
    }

    clearTempConditionRules() {
        this.tempConditionRules = "";
        this.tempConditionRulesDesc = "";
        this.forwardAddModel.selectedMonths = [];
        this.forwardAddModel.selectedDays = [];
        this.forwardAddModel.selectedDates = [];
        this.initialValue = 0;
        this.finalValue = 0;
        this.addToExistingRuleHidden = false;
    }

}