'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { usePermissions } from '../hooks';
import { FEATURES_LIST, ACTIONS_LIST, ROLE_LABELS } from '../mock';
import type { FeatureAction } from '../types';

export function PermissionsTable() {
  const { permissions, togglePermission } = usePermissions();

  return (
    <div className="space-y-6">
      {permissions.map((rolePermission) => (
        <Card key={rolePermission.role} className="border-border">
          <CardHeader>
            <CardTitle className="text-base">
              {ROLE_LABELS[rolePermission.role] ?? rolePermission.role}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[140px]">기능</TableHead>
                    {ACTIONS_LIST.map((action) => (
                      <TableHead key={action.key} className="w-[80px] text-center">
                        {action.label}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {FEATURES_LIST.map((feature) => {
                    const featureActions = rolePermission.permissions[feature.key] ?? [];
                    return (
                      <TableRow key={feature.key}>
                        <TableCell className="font-medium">{feature.label}</TableCell>
                        {ACTIONS_LIST.map((action) => (
                          <TableCell key={action.key} className="text-center">
                            <Checkbox
                              checked={featureActions.includes(action.key as FeatureAction)}
                              onCheckedChange={() =>
                                togglePermission(
                                  rolePermission.role,
                                  feature.key,
                                  action.key as FeatureAction,
                                )
                              }
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
