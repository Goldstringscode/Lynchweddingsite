const fs = require('fs');
let em = fs.readFileSync('components/dashboard/edit-menu-tab.tsx', 'utf8');

const marker = '{/* Summary card */}';
const summaryStart = em.indexOf(marker);
if (summaryStart < 0) { console.log('marker not found'); process.exit(1); }

const after = em.substring(summaryStart + marker.length);
const cardCloseIdx = after.indexOf('</Card>');
if (cardCloseIdx < 0) { console.log('</Card> not found'); process.exit(1); }
const endIdx = cardCloseIdx + 7;

const newSummary = `          {/* Summary card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="font-serif text-base">Menu Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">{selectedDraft.courses.length}</p>
                  <p className="text-xs text-muted-foreground">Total Items</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{drafts.length}</p>
                  <p className="text-xs text-muted-foreground">Saved Menus</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{selectedDraft.guest_count || 150}</p>
                  <p className="text-xs text-muted-foreground">Guest Count</p>
                </div>
                <div>
                  <p className="text-lg font-bold">
                    {selectedDraft.courses.length > 0 ? (selectedDraft.courses.reduce((sum, c) => {
                      const item = catalogMap.get(c.item_id)
                      const price = item?.suggested_menu_price ?? item?.price ?? 0
                      return sum + price
                    }, 0) / (selectedDraft.guest_count || 150)).toFixed(2) : "\\u2014"}
                  </p>
                  <p className="text-xs text-muted-foreground">Avg Cost / Guest</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-border/30 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-lg font-bold">{'$'}{selectedDraft.courses.length > 0 ? (selectedDraft.courses.reduce((sum, c) => {
                    const item = catalogMap.get(c.item_id)
                    const price = item?.suggested_menu_price ?? item?.price ?? 0
                    return sum + price
                  }, 0)).toFixed(2) : '0.00'}</p>
                  <p className="text-xs text-muted-foreground">Total Menu Value</p>
                </div>
                <div>
                  <p className="text-lg font-bold">{'$'}{(selectedDraft.courses.reduce((sum, c) => {
                    const item = catalogMap.get(c.item_id)
                    return sum + (item?.cost_per_serving ?? 0)
                  }, 0)).toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">Total Food Cost</p>
                </div>
                <div>
                  <p className="text-lg font-bold">
                    {selectedDraft.courses.length > 0 ? Math.round(
                      (1 - (selectedDraft.courses.reduce((s, c) => {
                        const item = catalogMap.get(c.item_id)
                        return s + (item?.cost_per_serving ?? 0)
                      }, 0) / Math.max(1, selectedDraft.courses.reduce((s, c) => {
                        const item = catalogMap.get(c.item_id)
                        const price = item?.suggested_menu_price ?? item?.price ?? 0
                        return s + price
                      }, 0)))) * 100 + '%' : '\\u2014'}
                  </p>
                  <p className="text-xs text-muted-foreground">Margin</p>
                </div>
                <div>
                  <p className="text-lg font-bold">{selectedDraft.courses.filter(c => {
                    const item = catalogMap.get(c.item_id)
                    return item?.is_signature
                  }).length}</p>
                  <p className="text-xs text-muted-foreground">Signature Items</p>
                </div>
              </div>
            </CardContent>
          </Card>`;

em = em.substring(0, summaryStart) + newSummary + em.substring(summaryStart + marker.length + endIdx);
fs.writeFileSync('components/dashboard/edit-menu-tab.tsx', em, 'utf8');
console.log('Edit menu summary replaced');