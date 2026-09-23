export function shouldRegisterServiceWorker(cap) {
  try {
    return !cap.isNativePlatform();
  } catch {
    return true;
  }
}
