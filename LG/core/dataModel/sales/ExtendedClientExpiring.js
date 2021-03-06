BASE.require(["LG.core.dataModel.sales.Client"], function () {
    BASE.namespace("LG.core.dataModel.sales");

    var _globalObject = this;

    LG.core.dataModel.sales.ExtendedClientExpiring = (function (Super) {
        var Client = function () {
            var self = this;
            if (self === _globalObject) {
                throw new Error("Client constructor invoked with global context.  Say new.");
            }

            Super.call(self);

            self["id"] = null;
            self["name"] = null;

            self["isArchived"] = null;
            self["street1"] = null;
            self["street2"] = null;
            self["city"] = null;
            self["state"] = null;
            self["zip"] = null;
            self["country"] = null;
            self["county"] = null;
            self["longitude"] = null;
            self["latitude"] = null;
            self["primaryContactFirstName"] = null;
            self["primaryContactLastName"] = null;
            self["primaryContactWorkAreaCode"] = null;
            self["primaryContactWorkCountryCode"] = null;
            self["primaryContactWorkExtension"] = null;
            self["primaryContactWorkLineNumber"] = null;
            self["expirationDate"] = null;
            self["potentialRevenue"] = null;
            self["policyDaysToExpiration"] = null;
            self["distance"] = null;
            self["lastViewed"] = null;

            self["ownerId"] = null;
            self["createdDate"] = null;
            self["lastModifiedDate"] = null;
            self["startDate"] = null;
            self["endDate"] = null;

            self['clientToClientTags'] = [];
            self['clientUserSettings'] = [];
            self['clientAddresses'] = [];
            self['opportunities'] = [];
            self['partners'] = [];
            self['attachments'] = [];
            self['contacts'] = [];
            self['notes'] = [];

            return self;
        };

        BASE.extend(Client, Super);

        return Client;
    }(LG.core.dataModel.sales.Client));
});