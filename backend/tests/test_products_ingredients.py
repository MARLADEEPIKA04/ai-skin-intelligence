import pytest

def test_products_catalog_and_recommendations(client, patient_headers):
    # 1. Product listing
    list_res = client.get("/api/products", headers=patient_headers)
    assert list_res.status_code == 200
    data = list_res.json()
    products = data.get("products", data)
    assert isinstance(products, list)
    assert len(products) > 0
    first_product_id = products[0]["id"]

    # 2. Personalized recommendations
    rec_res = client.get("/api/products/recommendations", headers=patient_headers)
    assert rec_res.status_code == 200
    rec_data = rec_res.json()
    assert "recommendations" in rec_data
    assert len(rec_data["recommendations"]) > 0
    top_rec = rec_data["recommendations"][0]
    assert "suitability_score" in top_rec
    assert "reasons" in top_rec

    # 3. Product comparison
    if len(products) >= 2:
        compare_res = client.post("/api/products/compare", json={
            "product_ids": [products[0]["id"], products[1]["id"]]
        }, headers=patient_headers)
        assert compare_res.status_code == 200
        comp_data = compare_res.json()
        assert "products" in comp_data
        assert len(comp_data["products"]) == 2

    # 4. Product alternatives
    alt_res = client.get(f"/api/products/alternatives/{first_product_id}", headers=patient_headers)
    assert alt_res.status_code == 200
    alt_data = alt_res.json()
    assert "source_product" in alt_data
    assert "alternatives" in alt_data

def test_ingredients_pharmacopoeia(client, patient_headers):
    # 1. Ingredient catalog search
    search_res = client.get("/api/ingredients?query=Niacinamide", headers=patient_headers)
    assert search_res.status_code == 200
    data = search_res.json()
    results = data.get("ingredients", data)
    assert isinstance(results, list)
    assert len(results) > 0
    assert "Niacinamide" in results[0]["name"]

    # 2. Ingredient compatibility analysis
    analysis_res = client.post("/api/ingredients/analyze", json={
        "ingredient_name": "Salicylic Acid"
    }, headers=patient_headers)
    assert analysis_res.status_code == 200
    analysis = analysis_res.json()
    assert "personalized_fit" in analysis
    assert "score" in analysis["personalized_fit"]
