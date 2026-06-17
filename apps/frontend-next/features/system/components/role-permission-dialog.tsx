'use client';

import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { ChevronRight, ChevronDown, Search } from 'lucide-react';
import {
  useMenuOptions,
  useRoleMenuIds,
  useUpdateRoleMenus,
} from '../hooks/use-role';
import type { Role, MenuOption } from '../types/role';

interface RolePermissionDialogProps {
  open: boolean;
  onClose: () => void;
  role: Role | null;
}

export function RolePermissionDialog({
  open,
  onClose,
  role,
}: RolePermissionDialogProps) {
  const [search, setSearch] = useState('');
  const [checkedIds, setCheckedIds] = useState<Set<number>>(new Set());
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const hasInitialized = useRef(false);

  const { data: menuOptions = [] } = useMenuOptions();
  const { data: roleMenuIds, isSuccess } = useRoleMenuIds(role?.id ?? null);
  const updateMutation = useUpdateRoleMenus();

  // Reset when dialog closes
  useEffect(() => {
    if (!open) {
      hasInitialized.current = false;
      setCheckedIds(new Set());
      setSearch('');
    }
  }, [open]);

  // Initialize checkedIds when data is loaded (only once per open)
  useEffect(() => {
    if (open && isSuccess && !hasInitialized.current) {
      hasInitialized.current = true;
      setCheckedIds(new Set(roleMenuIds ?? []));
    }
  }, [open, isSuccess, roleMenuIds]);

  const toggleExpand = (id: number) => {
    const newSet = new Set(expandedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedIds(newSet);
  };

  const getAllIds = (options: MenuOption[]): number[] => {
    const ids: number[] = [];
    for (const opt of options) {
      ids.push(opt.value);
      if (opt.children) {
        ids.push(...getAllIds(opt.children));
      }
    }
    return ids;
  };

  const handleCheck = (
    id: number,
    checked: boolean,
    children?: MenuOption[]
  ) => {
    const newSet = new Set(checkedIds);
    if (checked) {
      newSet.add(id);
      if (children) {
        getAllIds(children).forEach((cid) => newSet.add(cid));
      }
    } else {
      newSet.delete(id);
      if (children) {
        getAllIds(children).forEach((cid) => newSet.delete(cid));
      }
    }
    setCheckedIds(newSet);
  };

  const handleSubmit = async () => {
    if (!role) return;
    await updateMutation.mutateAsync({
      roleId: role.id,
      menuIds: Array.from(checkedIds),
    });
    onClose();
  };

  const filterMenus = (
    options: MenuOption[],
    keyword: string
  ): MenuOption[] => {
    if (!keyword) return options;
    return options
      .map((opt) => {
        const childMatches = opt.children
          ? filterMenus(opt.children, keyword)
          : [];
        if (opt.label.includes(keyword) || childMatches.length > 0) {
          return {
            ...opt,
            children: childMatches.length > 0 ? childMatches : opt.children,
          };
        }
        return null;
      })
      .filter(Boolean) as MenuOption[];
  };

  const filteredMenus = filterMenus(menuOptions, search);

  const renderTree = (options: MenuOption[], level = 0) => {
    return options.map((opt) => {
      const hasChildren = opt.children && opt.children.length > 0;
      const isExpanded = expandedIds.has(opt.value);
      const isChecked = checkedIds.has(opt.value);

      return (
        <div key={opt.value}>
          <div
            className="flex items-center gap-2 py-1 hover:bg-muted/50 rounded px-2"
            style={{ paddingLeft: level * 20 + 8 }}
          >
            {hasChildren && (
              <button
                type="button"
                onClick={() => toggleExpand(opt.value)}
                className="p-0.5 hover:bg-muted rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            )}
            {!hasChildren && <span className="w-5" />}
            <Checkbox
              checked={isChecked}
              onCheckedChange={(checked) =>
                handleCheck(opt.value, !!checked, opt.children)
              }
            />
            <span className="text-sm">{opt.label}</span>
          </div>
          {hasChildren && isExpanded && renderTree(opt.children!, level + 1)}
        </div>
      );
    });
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-[500px] sm:max-w-[500px]">
        <SheetHeader>
          <SheetTitle>【{role?.name}】権限設定</SheetTitle>
        </SheetHeader>

        <div className="py-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="メニュー名で検索..."
              className="pl-9"
            />
          </div>

          <ScrollArea className="h-[calc(100vh-220px)]">
            <div className="space-y-0.5">{renderTree(filteredMenus)}</div>
          </ScrollArea>
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={onClose}>
            キャンセル
          </Button>
          <Button onClick={handleSubmit} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? '保存中...' : '保存'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
