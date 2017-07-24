/* global FlowRouter */
//filters for user model
import {
  SUB_STAGES_LEAD,
  SUB_STAGES_OPP,
  SUB_STAGES_ORDER,
  SUB_STAGE_TICKET
} from '../constants/project'

const userSchema = {
    '_id': 'vJCpYSFfodTnP9Zz7',
    'createdAt': new Date(),
    'username': 'root',
    'emails': [
        {
            'address': 'root@admin.com',
            'verified': false
        }
    ],
    'profile': {
        'firstName': 'Root',
        'lastName': 'Admin',
        'role': [
            {
                'role': 'admin'
            }
        ]
    },
    'roles': [
        'superAdmin'
    ],
    'slack': {
        'id' : 'U4727J7V1',
        'team_id' : 'T40CFHLUD',
        'name' : 'alexboyko',
        'deleted' : false,
        'status' : null,
        'color' : 'e7392d',
        'real_name' : 'alex boyko',
        'tz' : 'Europe/Helsinki',
        'tz_label' : 'Eastern European Time',
        'tz_offset' : 7200,
        'profile' : {
            'first_name' : 'alex',
            'last_name' : 'boyko',
            'avatar_hash' : 'g40cca5f8256',
            'real_name' : 'alex boyko',
            'real_name_normalized' : 'alex boyko',
            'email' : 'frayeralex@gmail.com',
            'image_24' : 'https://secure.gravatar.com/avatar/40cca5f8256a0519a331a3d02093f900.jpg?s=24&d=https%3A%2F%2Fa.slack-edge.com%2F66f9%2Fimg%2Favatars%2Fava_0013-24.png',
            'image_32' : 'https://secure.gravatar.com/avatar/40cca5f8256a0519a331a3d02093f900.jpg?s=32&d=https%3A%2F%2Fa.slack-edge.com%2F0180%2Fimg%2Favatars%2Fava_0013-32.png',
            'image_48' : 'https://secure.gravatar.com/avatar/40cca5f8256a0519a331a3d02093f900.jpg?s=48&d=https%3A%2F%2Fa.slack-edge.com%2F66f9%2Fimg%2Favatars%2Fava_0013-48.png',
            'image_72' : 'https://secure.gravatar.com/avatar/40cca5f8256a0519a331a3d02093f900.jpg?s=72&d=https%3A%2F%2Fa.slack-edge.com%2F66f9%2Fimg%2Favatars%2Fava_0013-72.png',
            'image_192' : 'https://secure.gravatar.com/avatar/40cca5f8256a0519a331a3d02093f900.jpg?s=192&d=https%3A%2F%2Fa.slack-edge.com%2F7fa9%2Fimg%2Favatars%2Fava_0013-192.png',
            'image_512' : 'https://secure.gravatar.com/avatar/40cca5f8256a0519a331a3d02093f900.jpg?s=512&d=https%3A%2F%2Fa.slack-edge.com%2F7fa9%2Fimg%2Favatars%2Fava_0013-512.png'
        },
        'is_admin' : false,
        'is_owner' : false,
        'is_primary_owner' : false,
        'is_restricted' : false,
        'is_ultra_restricted' : false,
        'is_bot' : false,
        'has_2fa' : false,
        '_id' : 'cNdtxGzkX62fWMKdn'
    }
}

export const getUserName = (user, full) => {
    if(!user) return
    const { username } = user
    const { firstName, lastName } = user.profile

    if(!full && username) return username
    if(firstName && lastName ) return `${firstName} ${lastName}`

    return firstName ? firstName : lastName ? lastName : 'guest'
}

export const getUserEmail = (user) => {
    if(!user) return
    const { emails } = user
    if(emails[0].address) return emails[0].address
}

export const getAvatarUrl = (user) => {
    const defaultUser = FlowRouter.url('/icons/user.png')
    if(!user || !user.slack) return defaultUser
    return user.slack.profile.image_48 ? user.slack.profile.image_48 : defaultUser
}


export const getSlackUsername = (user) => {
    if(!user.slack) return getUserName(user, true)
    return user.slack.name
}

export const getUserRoles = (user) => {
    const { roles } = user
    if(!user || !Array.isArray(roles)) return
    if(roles.length == 1){
        return roles[0]
    }else if(roles.length > 1){
        let emails = ''
        roles.forEach(item => {
            emails += `${item}, `
        })
        emails = emails.slice(-2)
        return emails
    }
}

export const getUserSignature = (user) => {
    if(!user) return
    const { profile } = user
    return profile.signature ? profile.signature : ''
}

export const getSubStages = (stage, options) => {
  const {
    gettingFirstStage
  } = options
  let subStages = []
  switch (stage) {
    case 'lead': subStages = SUB_STAGES_LEAD; break
    case 'opportunity': subStages = SUB_STAGES_OPP; break
    case 'order': subStages = SUB_STAGES_ORDER; break
    case 'ticket': subStages = SUB_STAGE_TICKET; break
    default: break
  }

  if(gettingFirstStage) return subStages[0].value

  return subStages
}
