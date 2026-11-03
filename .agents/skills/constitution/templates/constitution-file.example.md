# Rule 1 - 訂單金額欄位必須以整數的最小貨幣單位表示

- 訂單、付款與退款的金額欄位必須使用整數的最小貨幣單位（例如新台幣以元、美元以分）。
- 金額欄位不得使用浮點數。

## Good Example

- `totalAmount` 使用 `integer`，並在 `description` 標明單位。

```yaml
components:
  schemas:
    Order:
      type: object
      properties:
        totalAmount:
          type: integer
          description: 訂單總金額，單位為最小貨幣單位
          example: 1280
```

## Bad Example

- `totalAmount` 使用 `number` 與小數，會產生浮點數誤差。

```yaml
components:
  schemas:
    Order:
      type: object
      properties:
        totalAmount:
          type: number
          format: float
          example: 12.8
```
