package com.youlai.boot.common.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Component;

/**
 * Message Utility for i18n support
 *
 * Retrieves localized messages based on current request locale
 *
 * @author jason.w
 */
@Component
@Slf4j
public class MessageUtils {

    private static MessageSource messageSource;

    public MessageUtils(MessageSource messageSource) {
        MessageUtils.messageSource = messageSource;
    }

    /**
     * Get message by key
     *
     * @param key message key
     * @return localized message
     */
    public static String getMessage(String key) {
        return getMessage(key, null);
    }

    /**
     * Get message by key with arguments
     *
     * @param key message key
     * @param args message arguments
     * @return localized message
     */
    public static String getMessage(String key, Object[] args) {
        try {
            return messageSource.getMessage(key, args, LocaleContextHolder.getLocale());
        } catch (Exception e) {
            log.warn("Message key not found: {}", key);
            return key;
        }
    }
}
