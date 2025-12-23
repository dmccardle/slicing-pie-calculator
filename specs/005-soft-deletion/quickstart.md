# Quickstart: Soft Deletion Testing Scenarios

## Setup

Start the development server:
```bash
npm run dev
```

Open the app at http://localhost:3000

## Test Scenarios

### Scenario 1: Soft Delete a Contributor (US1)

**Prerequisites**: At least one contributor with contributions exists

1. Navigate to **Contributors** page
2. Note the total slices displayed on the Dashboard
3. Click **Delete** on a contributor with contributions
4. Confirm deletion in the modal
5. **Verify**:
   - Contributor no longer appears in Contributors list
   - Total slices on Dashboard decreased by contributor's slice total
   - Pie chart no longer shows the contributor
   - Equity percentages recalculated for remaining contributors

### Scenario 2: Soft Delete an Individual Contribution (US2)

**Prerequisites**: At least one contribution exists

1. Navigate to **Contributions** page
2. Note the total slices and contributor's slice count
3. Click **Delete** on a specific contribution
4. Confirm deletion
5. **Verify**:
   - Contribution no longer appears in Contributions list
   - Total slices decreased by contribution amount
   - Contributor still appears (only the contribution was deleted)
   - Contributor's equity percentage decreased accordingly

### Scenario 3: View Deleted Items (US3)

**Prerequisites**: At least one item has been soft-deleted

1. Navigate to **Deleted Items** (sidebar link)
2. **Verify**:
   - Deleted contributors appear in "Contributors" section
   - Deleted contributions appear in "Contributions" section
   - Each item shows its deletion timestamp
   - Cascade-deleted contributions show which contributor triggered deletion

### Scenario 4: Restore a Contributor with Cascade (US4)

**Prerequisites**: A contributor with contributions has been soft-deleted

1. Navigate to **Deleted Items** page
2. Find the deleted contributor
3. Click **Restore**
4. **Verify**:
   - Contributor reappears in Contributors list
   - All cascade-deleted contributions reappear in Contributions list
   - Total slices restored to previous value
   - Equity percentages recalculated correctly
   - Independently deleted contributions remain in trash

### Scenario 5: Restore an Individual Contribution (US4)

**Prerequisites**: A contribution has been individually soft-deleted (not cascade)

1. Navigate to **Deleted Items** page
2. Find the deleted contribution
3. Click **Restore**
4. **Verify**:
   - Contribution reappears in Contributions list
   - Contributor's slice count increased
   - Total slices increased
   - Equity percentages recalculated

### Scenario 6: Activity Log Tracks Events (US5)

**Prerequisites**: Perform deletion and restoration actions

1. Delete a contributor
2. Restore a contribution
3. View the Dashboard
4. **Verify**:
   - Recent Activity section shows deletion event
   - Recent Activity section shows restoration event
   - Events show timestamp and slices affected

### Scenario 7: Cascade vs Individual Deletion Behavior

**Prerequisites**: Contributor with multiple contributions

1. Delete one contribution individually (not the contributor)
2. Delete the contributor (remaining contributions cascade-deleted)
3. Restore the contributor
4. **Verify**:
   - The individually deleted contribution remains in trash
   - Only cascade-deleted contributions are restored with contributor
   - Slices reflect only the restored contributions

### Scenario 8: Permanent Delete from Trash

**Prerequisites**: Items exist in trash

1. Navigate to **Deleted Items** page
2. Click **Permanently Delete** on an item
3. Confirm permanent deletion
4. **Verify**:
   - Item no longer appears in trash
   - Item cannot be restored
   - Storage no longer contains the item

### Scenario 9: Empty State in Trash

**Prerequisites**: No deleted items

1. Restore or permanently delete all items in trash
2. Navigate to **Deleted Items** page
3. **Verify**:
   - Empty state message is displayed
   - No tables or lists shown

### Scenario 10: Equity Calculations Exclude Deleted

**Prerequisites**: Multiple contributors with contributions

1. Note current equity percentages on Dashboard
2. Delete one contributor
3. **Verify**:
   - Remaining contributors' percentages sum to 100%
   - Deleted contributor's slices are not in total
   - Pie chart shows correct distribution

## Edge Cases

### Delete All Contributors
1. Delete all contributors
2. **Verify**: Dashboard shows empty state, total slices = 0

### Delete Contributor Then Individual Contribution
1. Delete contributor (cascade to contributions)
2. While in trash, the contributions show they were cascade-deleted
3. **Verify**: Cannot independently restore cascade-deleted contributions

### Vesting Exclusion
1. Delete a contributor with vesting configured
2. Navigate to **Projections** page
3. **Verify**: Deleted contributor not included in vesting projections
