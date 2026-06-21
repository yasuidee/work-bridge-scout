import { PageContainer } from "@/components/layout/PageContainer";
import { Card, CardContent, CardHeader, CardTitle, Input, Label, Select, Button } from "@/components/ui";
import { TENANT } from "@/lib/constants";

export default function SettingsPage() {
  return (
    <PageContainer title="設定" description="アカウントと通知の設定です。">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>企業情報</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>企業名</Label>
              <Input defaultValue={TENANT.companyName} />
            </div>
            <div>
              <Label>プラン</Label>
              <Select defaultValue={TENANT.planName}>
                <option>Enterprise</option>
                <option>Business</option>
                <option>Standard</option>
              </Select>
            </div>
            <Button>保存</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>AI推薦の設定</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="h-4 w-4 accent-brand-600" />
              新着のおすすめ候補者をメール通知する
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="h-4 w-4 accent-brand-600" />
              フィードバックを推薦の改善に利用する
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="h-4 w-4 accent-brand-600" />
              条件外の候補者も推薦一覧に表示する
            </label>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
