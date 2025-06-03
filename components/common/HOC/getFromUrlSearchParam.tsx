export function getFromUrlSearchParam() {
    return `fromUrl=${encodeURIComponent(location.href.replace(location.origin, ''))}`
}
