"use strict";
// DO NOT EDIT THIS FILE, EDIT THE GRUNT TASK NGCONSTANT SETTINGS INSTEAD WHICH GENERATES THIS FILE
angular.module('cloudoptingApp')
    .constant("SERVICE", {
        "ROLE" : {
            "PUBLISHER"  : "ROLE_PUBLISHER",
            "ADMIN"  : "ROLE_ADMIN",
            "OPERATOR"  : "ROLE_OPERATOR",
            "SUBSCRIBER"  : "ROLE_SUBSCRIBER"
        },
        "STATUS" : {
            "UNFINISHED" : "UNFINISHED"
        },
        "STORAGE" : {
            "CURRENT_APP" : "currentApplication"
        }
    }
)
;