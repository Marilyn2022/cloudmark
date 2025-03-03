"use client";

import { useState, useEffect, useCallback } from "react";
import type { BookmarkInstance, BookmarksData } from "@/lib/types";
import { BookmarkCard } from "@/components/bookmark-card";
import { Search, Layers } from "lucide-react";
import { useTranslations } from "next-intl";
import { DemoBanner } from "./demo-banner";
import { DialogAdd } from "./dialog-add";
import { BookmarkletButton } from "./bookmarklet-button";
import { useToast } from "./toast-provider";

export interface BookmarkUIProps {
  mark: string;
  bookmarksData: BookmarksData | null;
  categories: string[];
  toast: { status: string; message: string } | null;
  baseUrl: string;
}

export function BookmarkUI({
  mark,
  bookmarksData,
  categories,
  toast,
  baseUrl,
}: BookmarkUIProps) {
  const t = useTranslations("BookmarksPage");
  const nt = useTranslations("Notifications");
  const { showToast } = useToast();
  const [currentBookmarksData, setCurrentBookmarksData] =
    useState<BookmarksData | null>(bookmarksData);

  useEffect(() => {
    if (toast) {
      const variant = toast.status === "success" 
        ? "success" 
        : toast.status === "error" 
          ? "error" 
          : toast.status === "warning" 
            ? "warning" 
            : "info";
      
      showToast({
        title: nt(toast.status),
        description: nt(toast.message),
        variant,
      });
    }
  }, [toast, showToast, nt]);

  const onBookmarkAdded = useCallback(
    (bookmark: BookmarkInstance) => {
      if (currentBookmarksData) {
        setCurrentBookmarksData({
          ...currentBookmarksData,
          bookmarks: [...currentBookmarksData.bookmarks, bookmark],
        });
      }
    },
    [currentBookmarksData]
  );

  const onUpdateBookmark = useCallback(
    (bookmark: BookmarkInstance) => {
      if (currentBookmarksData) {
        setCurrentBookmarksData({
          ...currentBookmarksData,
          bookmarks: currentBookmarksData.bookmarks.map((b) =>
            b.uuid === bookmark.uuid ? bookmark : b
          ),
        });
      }
    },
    [currentBookmarksData]
  );

  const onDeleteBookmark = useCallback(
    (uuid: string) => {
      if (currentBookmarksData) {
        setCurrentBookmarksData({
          ...currentBookmarksData,
          bookmarks: currentBookmarksData.bookmarks.filter(
            (b) => b.uuid !== uuid
          ),
        });
      }
    },
    [currentBookmarksData]
  );

  return (
    <div className="container relative">
      {/* 装饰背景元素 */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-blue-500/10 rounded-full blur-3xl transform -translate-y-12 translate-x-12" />
        <div className="absolute bottom-0 left-0 w-[50rem] h-[50rem] bg-purple-500/10 rounded-full blur-3xl transform translate-y-12 -translate-x-12" />
        <div className="absolute bottom-1/3 right-1/4 w-[30rem] h-[30rem] bg-indigo-500/5 rounded-full blur-3xl" />
      </div>

      <div className="py-12 lg:py-16">
        <DemoBanner mark={mark} />

        {/* 标题区域 */}
        <div className="title-area flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <div className="title-text flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500">
                {t("title")}
              </h1>
            </div>
            <p className="subtitle-text text-muted-foreground">
              {t("collection", { mark })}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <DialogAdd
              mark={mark}
              categories={categories}
              onBookmarkAdded={onBookmarkAdded}
            />

            <div>
              <BookmarkletButton mark={mark} baseUrl={baseUrl} />
              <div className="hidden sm:flex items-center mt-1 text-xs text-muted-foreground">
                <span className="animate-pulse">↑</span>
                <span className="ml-1">{t("dragTip")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 书签列表 */}
        {bookmarksData && bookmarksData.bookmarks.length > 0 ? (
          <div className="stagger-container space-y-8">
            {categories.map((category, categoryIndex) => {
              const categoryBookmarks = bookmarksData.bookmarks.filter(
                (b) => b.category === category
              );

              if (categoryBookmarks.length === 0) return null;

              return (
                <div
                  key={category}
                  className={`stagger-item delay-${
                    categoryIndex * 100
                  } overflow-hidden`}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center px-3 py-1.5 bg-primary/10 text-primary rounded-lg">
                      <Layers className="h-4 w-4 mr-2 opacity-70" />
                      <h3 className="text-md font-medium">{category}</h3>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ({categoryBookmarks.length})
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categoryBookmarks.map((bookmark, index) => (
                      <div
                        key={bookmark.uuid}
                        className={`h-full w-full delay-${(index % 9) * 100}`}
                      >
                        <BookmarkCard
                          bookmark={bookmark}
                          mark={mark}
                          categories={categories}
                          onBookmarkUpdated={onUpdateBookmark}
                          onBookmarkDeleted={() =>
                            onDeleteBookmark(bookmark.uuid)
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state text-center py-16 px-4">
            <div className="max-w-md mx-auto">
              <div className="bg-card/50 backdrop-blur-sm border border-border/60 rounded-xl p-8 shadow-sm">
                <div className="flex justify-center mb-4">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-md"></div>
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                </div>
                <p className="text-muted-foreground text-lg mb-6">
                  {t("noBookmarks")}
                </p>
                <div className="hover-scale flex justify-center">
                  <DialogAdd
                    mark={mark}
                    categories={categories}
                    onBookmarkAdded={onBookmarkAdded}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
