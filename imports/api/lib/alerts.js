import Alert from 'react-s-alert'

export const warning = (text) => {
    if(text)
    return Alert.warning(text, {
        position: 'bottom-right',
        effect: 'bouncyflip',
        timeout: 5000
    })
}

export const info = (text) => {
    if(text)
        return Alert.info(text, {
            position: 'bottom-right',
            effect: 'bouncyflip',
            timeout: 3500
        })
}